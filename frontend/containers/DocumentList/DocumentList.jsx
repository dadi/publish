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

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {connectHelper, filterHiddenFields, isValidJSON, slugify} from 'lib/util'
import {getCurrentApi, getCurrentCollection} from 'lib/app-config'

import Button from 'components/Button/Button'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import FieldBooleanListView from 'components/FieldBoolean/FieldBooleanListView'
import FieldStringListView from 'components/FieldString/FieldStringListView'
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

  componentDidUpdate(prevProps) {
    const {
      actions,
      parentDocumentId,
      referencedField,
      state
    } = this.props
    const {list, status} = state.documents
    const pathKey = prevProps.state.router.locationBeforeTransitions.key
    const previousPathKey = state.router.locationBeforeTransitions.key
    const historyKeyMatch = pathKey === previousPathKey
    const apisWithoutCollections = state.api.apis.filter(api => !api.hasCollections).length
    const isIdle = status === Constants.STATUS_IDLE
    const wasLoading = prevProps.state.documents.status === Constants.STATUS_LOADING

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

    // State check: reject when missing config, session, or apis
    if (!state.app.config || !state.api.apis.length || !state.user) return

    // State check: reject when there are still APIs without collections
    if (apisWithoutCollections) return

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
      onPageTitle,
      order,
      referencedField,
      selectLimit,
      sort,
      state
    } = this.props
    const currentCollection = getCurrentCollection(state.api.apis, group, collection, referencedField)
    const documents = state.documents

    if (!documents.list || documents.status === Constants.STATUS_LOADING || !currentCollection) {
      return null
    }

    const collectionFields = currentCollection.fields
    const tableColumns = Object.keys(filterHiddenFields(collectionFields, 'list'))
      .map(field => {
        return {
          id: field,
          label: collectionFields[field].label
        }
      })
    const selectedRows = this.getSelectedRows()
    const documentsList = documents.list.results
    const metadata = documents.list.metadata
    const query = documents.query

    // Setting page title
    if (typeof onPageTitle === 'function') {
      onPageTitle.call(this, currentCollection.settings.description || currentCollection.name)
    }

    if (!documentsList.length && !query) {
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
        {documentsList.length > 0 && (
          <SyncTable
            columns={tableColumns}
            data={documents.list.results}
            onRender={this.handleAnchorRender.bind(this)}
            onSelect={this.handleRowSelect.bind(this)}
            onSort={this.handleTableSort.bind(this)}
            selectedRows={selectedRows}
            selectLimit={selectLimit}
            sortable={true}
            sortBy={sort}
            sortOrder={order}
          />
        )}
        <DocumentListToolbar
          collection={collection}
          group={group}
          isReferencedField={Boolean(referencedField)}
          metadata={metadata}
          onBulkAction={this.handleBulkAction.bind(this)}
          onReferenceDocumentSelect={this.handleReferenceDocumentSelect.bind(this)}
          selectedDocuments={documents.selected}
        />
        {query && !documentsList.length && (
          <div>
            <h1>0 results</h1>
            <p>There are no documents that match these filters</p>
          </div>
        )}
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
    const currentApi = getCurrentApi(state.api.apis, group, collection)
    const currentCollection = getCurrentCollection(state.api.apis, group, collection, referencedField)
    const count = currentCollection.settings && currentCollection.settings.count || 20
    const filterValue = state.router.params ? state.router.params.filter : null
    const parentCollection = referencedField && getCurrentCollection(state.api.apis, group, collection)

    actions.fetchDocuments({
      api: currentApi,
      collection: currentCollection.name,
      count,
      filters: filterValue,
      page,
      parentDocumentId,
      parentCollection: parentCollection && parentCollection.name,
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

    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
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
    const {state} = this.props
    console.log('(*) Selected documents:', state.documents.selected, actionType)
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
    const referencedCollection = getCurrentCollection(state.api.apis, group, collection, referencedField)
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

    const parentCollection = getCurrentCollection(state.api.apis, group, collection)
    const referenceFieldSchema = parentCollection.fields[referencedField]
    const referenceFieldSection = referenceFieldSchema &&
      referenceFieldSchema.publish &&
      referenceFieldSchema.publish.section &&
      slugify(referenceFieldSchema.publish.section)

    route(buildUrl(group, collection, 'document', 'edit', parentDocumentId, referenceFieldSection))
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

  renderField(fieldName, schema, value) {
    switch (schema.type) {
      case 'Boolean':
        return (
          <FieldBooleanListView
            schema={schema}
            value={value}
          />
        )

      case 'String':
        return (
          <FieldStringListView
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
    ...documentActions,
    ...documentsActions
  }, dispatch)
)(DocumentList)
