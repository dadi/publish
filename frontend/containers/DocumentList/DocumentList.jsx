'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {route} from 'preact-router'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'
import * as fieldComponents from 'lib/field-components'

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {connectHelper, filterHiddenFields, isValidJSON, slugify} from 'lib/util'
import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'

import Button from 'components/Button/Button'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import SyncTable from 'components/SyncTable/SyncTable'

/**
 * A table view with a list of documents.
 */
class DocumentList extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The name of the collection currently being listed.
     */
    collection: proptypes.string,

    /**
     * The JSON-stringified object of active filters.
     */
    filter: proptypes.string,

    /**
     * The name of the group where the current collection belongs (if any).
     */
    group: proptypes.string,

    /**
     * A callback to be fired if the container wants to attempt changing the
     * page title.
     */
    onPageTitle: proptypes.func,

    /**
     * The order used to sort the documents by the `sort` field.
     */
    order: proptypes.oneOf(['asc', 'desc']),

    /**
     * The number of the current active page.
     */
    page: proptypes.number,

    /**
     * When on a reference field, contains the ID of the parent document.
     */
    parentDocumentId: proptypes.string,

    /**
     * The name of a reference field currently being edited.
     */
    referencedField: proptypes.string,

    /**
     * The maximum number of documents that can be selected at the same time.
     */
    selectLimit: proptypes.number,

    /**
     * The name of the field currently being used to sort the documents.
     */
    sort: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  static defaultProps = {
    onPageTitle: (function () {})
  }

  componentDidUpdate(prevProps) {
    const {
      actions,
      referencedField,
      state
    } = this.props
    const {list, status} = state.documents
    const pathKey = prevProps.state.router.locationBeforeTransitions.key
    const previousPathKey = state.router.locationBeforeTransitions.key
    const historyKeyMatch = pathKey === previousPathKey
    const isIdle = status === Constants.STATUS_IDLE
    const previousStatus = prevProps.state.documents.status
    const wasLoading = previousStatus === Constants.STATUS_LOADING

    // If we are have just loaded a list of documents for a nested document,
    // let's update the selection with the value of the reference field, if
    // it is in view.
    if (referencedField && wasLoading && isIdle) {
      const document = Object.assign({}, state.document.remote, state.document.local)
      const referencedValue = document[referencedField]

      if (referencedValue && referencedValue._id) {
        actions.setDocumentSelection([referencedValue._id])
      }
    }

    // Have we just deleted a single document?
    if (isIdle && (previousStatus === Constants.STATUS_DELETING_SINGLE)) {
      actions.setNotification({
        message: 'The document has been deleted'
      })
    }

    // Have we just deleted multiple documents?
    if (isIdle && (previousStatus === Constants.STATUS_DELETING_MULTIPLE)) {
      actions.setNotification({
        message: 'The documents have been deleted'
      })
    }

    // State check: reject when missing config, session, or apis
    if (!state.app.config || !state.api.apis.length || !state.user) return

    // State check: reject when path matches and document list loaded
    if (list && historyKeyMatch) return

    // State check: reject when documents are still loading
    if (status === Constants.STATUS_LOADING) return

    this.fetchDocuments()
  }

  render() {
    const {
      collection,
      filter,
      group,
      order,
      referencedField,
      sort,
      state
    } = this.props
    const documents = state.documents

    this.currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      referencedField
    })

    if (!documents.list || documents.status === Constants.STATUS_LOADING || !this.currentCollection) {
      return null
    }

    const documentsList = documents.list

    if (!documentsList.results.length && !documents.query) {
      return (
        <HeroMessage
          title="No documents yet."
          subtitle="Once created, they will appear here."
        >
          <Button
            accent="save"
            href={buildUrl(group, collection, 'document', 'new')}
          >Create new document</Button>
        </HeroMessage>
      )
    }

    return (
      <div>
        {this.renderDocumentList()}

        <DocumentListToolbar
          collection={collection}
          group={group}
          isReferencedField={Boolean(referencedField)}
          metadata={documentsList.metadata}
          onBulkAction={this.handleBulkAction.bind(this)}
          onReferenceDocumentSelect={this.handleReferenceDocumentSelect.bind(this)}
          selectedDocuments={documents.selected}
        />
      </div>
    )
  }

  componentWillUnmount() {
    const {actions} = this.props

    actions.clearDocumentList()
  }

  fetchDocuments() {
    const {
      actions,
      collection,
      filter,
      group,
      order,
      page,
      parentDocumentId,
      referencedField,
      sort,
      state
    } = this.props
    const currentApi = getApiForUrlParams(state.api.apis, {
      collection,
      group
    })
    const currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      referencedField,
      useApi: currentApi
    })

    const count = currentCollection.settings && currentCollection.settings.count || 20
    const filterValue = state.router.params ? state.router.params.filter : null
    const parentCollection = referencedField && getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      useApi: currentApi
    })

    actions.fetchDocuments({
      api: currentApi,
      collection: currentCollection,
      count,
      filters: filterValue,
      page,
      parentDocumentId,
      parentCollection,
      referencedField,
      sortBy: sort,
      sortOrder: order
    })
  }

  getSelectedRows() {
    const {state} = this.props
    const documents = state.documents.list.results
    const selectedDocuments = state.documents.selected

    let selectedRows = {}

    documents.forEach((document, index) => {
      if (selectedDocuments.includes(document._id)) {
        selectedRows[index] = true
      }
    })

    return selectedRows
  }

  handleAnchorRender(value, data, column, index) {
    const {
      collection,
      group,
      referencedField,
      state
    } = this.props

    // If we're on a nested document view, we don't want to add links to
    // documents (for now).
    if (referencedField) {
      return value
    }

    const currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group
    })
    const fieldSchema = currentCollection.fields[column.id]
    const renderedValue = this.renderField(column.id, fieldSchema, value)

    if (index === 0) {
      return (
        <a href={buildUrl(group, collection, 'document/edit', data._id)}>{renderedValue}</a>
      )
    }

    return renderedValue
  }

  handleBulkAction(actionType) {
    const {
      actions,
      collection,
      group,
      state
    } = this.props
    const currentApi = getApiForUrlParams(state.api.apis, {
      collection,
      group
    })
    const currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      useApi: currentApi
    })

    if (actionType === 'delete') {
      actions.deleteDocuments({
        api: currentApi,
        collection: currentCollection,
        ids: state.documents.selected
      })
    }
  }

  handleReferenceDocumentSelect() {
    const {
      actions,
      collection,
      group,
      parentDocumentId,
      referencedField,
      state
    } = this.props
    const referencedCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      referencedField
    })
    const documentsList = state.documents.list.results

    // We might want to change this when we allow a field to reference multiple
    // documents. For now, we just get the first selected document.
    const selectedDocumentId = state.documents.selected[0]
    const selectedDocument = documentsList.find(document => {
      return document._id === selectedDocumentId
    })

    actions.updateLocalDocument({
      [referencedField]: selectedDocument
    })

    const parentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group
    })
    const referenceFieldSchema = parentCollection.fields[referencedField]
    const referenceFieldSection = referenceFieldSchema &&
      referenceFieldSchema.publish &&
      referenceFieldSchema.publish.section &&
      slugify(referenceFieldSchema.publish.section)

    if (parentDocumentId) {
      route(buildUrl(group, collection, 'document', 'edit', parentDocumentId, referenceFieldSection))
    } else {
      route(buildUrl(group, collection, 'document', 'new', referenceFieldSection))
    }
  }

  handleRowSelect(selectedRows) {
    const {actions, state} = this.props
    const documents = state.documents.list.results
    const selectedDocuments = state.documents.selected

    // This is the subset of selected documents that are currently not in view.
    // We'll leave these alone.
    const selectedNotInView = selectedDocuments.filter(documentId => {
      const matchingDocument = documents.find(document => {
        return document._id === documentId
      })

      return !matchingDocument
    })

    // This is the new subset of selected documents that are in view.
    const selectedInView = Object.keys(selectedRows)
      .filter(index => selectedRows[index])
      .map(index => documents[index]._id)

    // The new selection will be a combination of the two arrays.
    const newSelection = selectedNotInView.concat(selectedInView)

    actions.setDocumentSelection(newSelection)
  }

  handleTableSort(value, sortBy, sortOrder) {
    return (
      <a href={createRoute({
        params: {sort: sortBy, order: sortOrder},
        update: true
      })}>{value}</a>
    )
  }

  renderDocumentList() {
    const {
      collection,
      group,
      referencedField,
      onPageTitle,
      order,
      selectLimit,
      sort,
      state
    } = this.props
    const documents = state.documents.list.results
    const selectedRows = this.getSelectedRows()

    // If we're on a reference field select view, we'll see if there's a field
    // component for the referenced field type that exports a `referenceSelect`
    // context. If it does, we'll use that instead of the default `SyncTable`
    // to render the results.
    if (referencedField) {
      const parentCollection = getCollectionForUrlParams(state.api.apis, {
        collection,
        group
      })
      const fieldSchema = parentCollection.fields[referencedField]
      const fieldType = (fieldSchema.publish && fieldSchema.publish.subType) || fieldSchema.type
      const fieldComponentName = `Field${fieldType}`
      const FieldComponentReferenceSelect = fieldComponents[fieldComponentName].referenceSelect

      if (FieldComponentReferenceSelect) {
        return (
          <FieldComponentReferenceSelect
            data={documents}
            onSelect={this.handleRowSelect.bind(this)}
            onSort={this.handleTableSort.bind(this)}
            selectedRows={selectedRows}
            selectLimit={selectLimit}
            sortBy={sort}
            sortOrder={order}
          />
        )
      }

      onPageTitle(`Select ${(fieldSchema.label || referencedField).toLowerCase()}`)
    } else {
      onPageTitle(this.currentCollection.settings.description || this.currentCollection.name)
    }

    const tableColumns = Object.keys(filterHiddenFields(this.currentCollection.fields, 'list'))
      .map(field => {
        return {
          id: field,
          label: this.currentCollection.fields[field].label
        }
      })

    if (documents.length > 0) {
      return (
        <SyncTable
          columns={tableColumns}
          data={documents}
          onRender={this.handleAnchorRender.bind(this)}
          onSelect={this.handleRowSelect.bind(this)}
          onSort={this.handleTableSort.bind(this)}
          selectedRows={selectedRows}
          selectLimit={selectLimit}
          sortable={true}
          sortBy={sort}
          sortOrder={order}
        />
      )
    }

    return (
      <div>
        <h1>0 results</h1>
        <p>There are no documents that match these filters</p>
      </div>
    )
  }

  renderField(fieldName, schema, value) {
    const fieldType = schema.publish && schema.publish.subType ? schema.publish.subType : schema.type
    const fieldComponentName = `Field${fieldType}`
    const FieldComponentList = fieldComponents[fieldComponentName] && fieldComponents[fieldComponentName].list

    if (FieldComponentList) {
      return (
        <FieldComponentList
          schema={schema}
          value={value}
        />
      )
    }

    return value
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    document: state.document,
    documents: state.documents,
    router: state.router,
    user: state.user
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...documentActions,
    ...documentsActions
  }, dispatch)
)(DocumentList)
