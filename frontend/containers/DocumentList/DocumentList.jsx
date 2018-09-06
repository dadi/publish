'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {route} from '@dadi/preact-router'
import {Keyboard} from 'lib/keyboard'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'
import * as fieldComponents from 'lib/field-components'

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {filterVisibleFields} from 'lib/fields'
import {connectHelper} from 'lib/util'

import Button from 'components/Button/Button'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
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
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

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
    documentId: proptypes.string,

    /**
     * The name of a reference field currently being edited.
     */
    referencedField: proptypes.string,

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

  constructor(props) {
    super(props)

    this.keyboard = new Keyboard()
  }

  componentDidMount() {
    const {
      onBuildBaseUrl,
      page,
      state
    } = this.props
    const currentPage = Number(page)
    const nextPage = currentPage + 1
    const previousPage = Math.abs(currentPage -1)

    this.keyboard.on('cmd+right')
      .do(cmd => route(buildUrl(...onBuildBaseUrl(), nextPage)))
    this.keyboard.on('cmd+left')
      .do(cmd => route(buildUrl(...onBuildBaseUrl(), previousPage)))
  }

  componentDidUpdate(prevProps) {
    const {
      actions,
      referencedField,
      state
    } = this.props
    const documents = state.documents
    const pathKey = prevProps.state.router.locationBeforeTransitions.key
    const previousDocuments = prevProps.state.documents
    const previousPathKey = state.router.locationBeforeTransitions.key

    // If we are have just loaded a list of documents for a nested document,
    // let's update the selection with the value of the reference field, if
    // it is in view.
    if (referencedField && previousDocuments.isLoading && !documents.isLoading) {
      let document = Object.assign(
        {},
        state.document.remote,
        state.document.local
      )
      let referencedValues = document[referencedField]
      let referencedIds = (Array.isArray(referencedValues)
        ? referencedValues.map(value => value._id)
        : [referencedValues && referencedValues._id]
      ).filter(Boolean)

      if (referencedIds.length > 0) {
        actions.setDocumentSelection(referencedIds)
      }
    }

    // State check: reject when path matches and document list loaded
    if (documents.list && (pathKey === previousPathKey)) {
      return
    }

    this.checkStatusAndFetch()
  }

  componentWillUpdate(nextProps) {
    const {actions, state} = this.props
    const {state: nextState} = nextProps
    const currentCollection = state.api.currentCollection
    const nextCollection = nextState.api.currentCollection

    // This is required to recover from an error. If the document list has
    // errored and we're about to navigate to a different collection, we
    // clear the error state by setting the status to IDLE and let the
    // container fetch again.
    if (
      state.documents.remoteError &&
      currentCollection &&
      nextCollection &&
      (currentCollection.path !== nextCollection.path)
    ) {
      actions.setDocumentListStatus(Constants.STATUS_IDLE)
    }
  }

  render() {
    const {
      collection,
      filter,
      group,
      onBuildBaseUrl,
      order,
      referencedField,
      sort,
      state
    } = this.props
    const documents = state.documents
    const {currentCollection} = state.api
    const createLink = onBuildBaseUrl({
      createNew: true
    })

    if (documents.remoteError) {
      return (
        <ErrorMessage
          type={Constants.ERROR_ROUTE_NOT_FOUND}
        />
      )      
    }

    if (
      !documents.list ||
      !documents.list.results ||
      documents.isLoading ||
      !currentCollection
    ) {
      return null
    }

    const documentsList = documents.list

    if (!documentsList.results.length && !documents.query) {
      return (
        <HeroMessage
          title="No documents yet."
          subtitle="Once created, they will appear here."
        >
          {!referencedField && (
            <Button
              accent="save"
              href={createLink}
            >Create new document</Button>
          )}
        </HeroMessage>
      )
    }

    return this.renderDocumentList()
  }

  componentWillMount() {
    this.checkStatusAndFetch()
  }

  checkStatusAndFetch() {
    const {state} = this.props
    const {isLoading, list, status} = state.documents

    // State check: reject when missing config, session, or apis
    if (!state.app.config || !state.api.apis.length || !state.api.currentCollection) {
      return
    }

    if (!isLoading) {
      this.fetchDocuments()  
    }
  }

  componentWillUnmount() {
    const {actions} = this.props

    this.keyboard.off()
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
      documentId,
      referencedField,
      sort,
      state
    } = this.props
    const {
      currentApi,
      currentCollection,
      currentParentCollection
    } = state.api

    if (state.documents.remoteError) {
      return
    }

    let count = (currentCollection.settings && currentCollection.settings.count)
      || 20
    let filterValue = state.router.search ? state.router.search.filter : null

    actions.fetchDocuments({
      api: currentApi,
      collection: currentCollection,
      count,
      filters: filterValue,
      page,
      parentCollection: currentParentCollection,
      parentDocumentId: documentId,
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
      documentId,
      group,
      onBuildBaseUrl,
      referencedField,
      state
    } = this.props

    // If we're on a nested document view, we don't want to add links to
    // documents (for now).
    if (referencedField) {
      return value
    }

    let editLink = onBuildBaseUrl({
      documentId: documentId || data._id
    })
    let currentCollection = state.api.currentCollection
    let fieldSchema = currentCollection.fields[column.id]
    let renderedValue = this.renderField(column.id, fieldSchema, value)

    if (index === 0) {
      return (
        <a href={editLink}>{renderedValue}</a>
      )
    }

    return renderedValue
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
      sort,
      state
    } = this.props
    const {currentCollection, currentParentCollection} = state.api
    const documents = state.documents.list.results
    const config = state.app.config
    const selectedRows = this.getSelectedRows()

    let selectLimit = Infinity

    // If we're on a reference field select view, we'll see if there's a field
    // component for the referenced field type that exports a `referenceSelect`
    // context. If it does, we'll use that instead of the default `SyncTable`
    // to render the results.
    if (referencedField) {
      const fieldSchema = currentParentCollection.fields[referencedField]
      const fieldType = (fieldSchema.publish && fieldSchema.publish.subType) || fieldSchema.type
      const fieldComponentName = `Field${fieldType}`
      const FieldComponentReferenceSelect = fieldComponents[fieldComponentName].referenceSelect
      if (
        fieldSchema.settings &&
        fieldSchema.settings.limit &&
        fieldSchema.settings.limit > 0
      ) {
        selectLimit = fieldSchema.settings.limit
      }

      if (FieldComponentReferenceSelect) {
        return (
          <FieldComponentReferenceSelect
            config={config}
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
      onPageTitle(currentCollection.settings.description || currentCollection.name)
    }
    const listableFields = filterVisibleFields({
      fields: currentCollection.fields,
      view: 'list'
    })

    const tableColumns = Object.keys(listableFields)
      .map(field => {
        if (!currentCollection.fields[field]) return

        return {
          id: field,
          label: currentCollection.fields[field].label
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
      <HeroMessage
        title="No documents found."
        subtitle="We can't find anything matching those filters."
      >
        <Button
          accent="system"
          href={buildUrl(group, collection, 'documents')}
        >Clear filters</Button>
      </HeroMessage>
    )
  }

  renderField(fieldName, schema, value) {
    if (!schema) return

    const fieldType = (schema.publish && schema.publish.subType) ?
      schema.publish.subType : schema.type
    const fieldComponentName = `Field${fieldType}`
    const FieldComponentList = fieldComponents[fieldComponentName] &&
      fieldComponents[fieldComponentName].list

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
