import * as fieldComponents from 'lib/field-components'
import {getFieldType} from 'lib/fields'
import {Link} from 'react-router-dom'
import proptypes from 'prop-types'
import React from 'react'
import SyncTable from 'components/SyncTable/SyncTable'

/**
 * A table view for listing documents.
 */
export default class DocumentTableList extends React.Component {
  static propTypes = {
    /**
     * The API to operate on.
     */
    api: proptypes.object,

    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The application configuration object.
     */
    config: proptypes.object,

    /**
     * When on a reference field, contains the ID of the parent document.
     */
    documentId: proptypes.string,

    /**
     * The list of documents to display.
     */
    documents: proptypes.array,

    /**
     * The list of fields to display.
     */
    fields: proptypes.array,

    /**
     * A callback to be used to obtain the base URL for the given page, as
     * determined by the view.
     */
    onBuildBaseUrl: proptypes.func,

    /**
     * A callback to be fired with a new document selection.
     */
    onSelect: proptypes.func,

    /**
     * The order used to sort the documents by the `sort` field.
     */
    order: proptypes.oneOf(['asc', 'desc']),

    /**
     * The name of a reference field currently being edited (if any).
     */
    referencedField: proptypes.string,

    /**
     * A hash map of the indices of the currently selected documents.
     */
    selectedDocuments: proptypes.object,

    /**
     * The maximum number of documents that can be selected.
     */
    selectLimit: proptypes.number,

    /**
     * The name of the field currently being used to sort the documents.
     */
    sort: proptypes.string
  }

  getSelectedRows() {
    const {documents, selectedDocuments} = this.props
    const selectedRows = documents.reduce((selectedRows, item, index) => {
      if (selectedDocuments[item._id]) {
        selectedRows[index] = true
      }

      return selectedRows
    }, {})

    return selectedRows
  }

  handleRowRender(listableFields, value, data, column, index) {
    const {collection, documentId, onBuildBaseUrl, referencedField} = this.props

    // If we're on a nested document view, we don't want to add links to
    // documents (for now).
    if (referencedField) {
      return value
    }

    const editLink = onBuildBaseUrl({
      documentId: documentId || data._id,
      search: null
    })
    const fieldSchema = collection.fields[column.id]
    const renderedValue = this.renderField(fieldSchema, value)
    const firstStringField = Object.keys(listableFields).filter(field => {
      return listableFields[field].type === 'String'
    })[0]

    if (
      (firstStringField && firstStringField === column.id) ||
      (!firstStringField && index === 0)
    ) {
      return <Link to={editLink}>{renderedValue}</Link>
    }

    return renderedValue
  }

  handleTableSort(value, sortBy, sortOrder) {
    const {onBuildBaseUrl} = this.props
    const link = onBuildBaseUrl({
      search: {
        order: sortOrder,
        sort: sortBy
      }
    })

    return <Link to={link}>{value}</Link>
  }

  render() {
    const {
      collection,
      documents,
      fields: fieldsToDisplay = [],
      onSelect,
      order,
      selectedDocuments,
      sort
    } = this.props
    const collectionFields = (collection && collection.fields) || {}
    const listableFields = Object.keys(collectionFields).reduce(
      (fields, fieldName) => {
        if (fieldsToDisplay.includes(fieldName)) {
          fields[fieldName] = collectionFields[fieldName]
        }

        return fields
      },
      {}
    )
    const tableColumns = Object.keys(listableFields).map(field => {
      if (!collection.fields[field]) return undefined

      return {
        annotation: this.renderAnnotation(collection.fields[field]),
        id: field,
        label: collection.fields[field].label || field
      }
    })

    return (
      <SyncTable
        columns={tableColumns}
        data={documents}
        onRender={this.handleRowRender.bind(this, listableFields)}
        onSelect={onSelect}
        onSort={this.handleTableSort.bind(this)}
        selectedRows={selectedDocuments}
        selectLimit={Infinity}
        sortable={true}
        sortBy={sort}
        sortOrder={order}
      />
    )
  }

  renderAnnotation(schema) {
    const fieldType = getFieldType(schema)
    const fieldComponentName = `Field${fieldType}`
    const FieldComponentListHeadAnnotation =
      fieldComponents[fieldComponentName] &&
      fieldComponents[fieldComponentName].listHeadAnnotation

    if (FieldComponentListHeadAnnotation) {
      return <FieldComponentListHeadAnnotation />
    }
  }

  renderField(schema, value) {
    if (!schema) return

    const {api, collection, config} = this.props
    const fieldType = getFieldType(schema)
    const fieldComponentName = `Field${fieldType}`
    const FieldComponentList =
      fieldComponents[fieldComponentName] &&
      fieldComponents[fieldComponentName].list

    if (FieldComponentList) {
      return (
        <FieldComponentList
          config={config}
          collection={collection}
          currentApi={api}
          schema={schema}
          value={value}
        />
      )
    }

    return value
  }
}
