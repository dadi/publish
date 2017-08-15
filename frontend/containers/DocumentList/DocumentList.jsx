'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {route} from 'preact-router-regex'
import {Keyboard} from 'lib/keyboard'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'
import * as fieldComponents from 'lib/field-components'

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {connectHelper, filterHiddenFields} from 'lib/util'
import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'

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
    * A callback to be used to obtain the sibling document routes (edit, create and list), as
    * determined by the view.
    */
    onGetRoutes: proptypes.func,

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
      onGetRoutes,
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
      onGetRoutes,
      referencedField,
      state
    } = this.props
    const {list} = state.documents
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

    // State check: reject when path matches and document list loaded
    if (list && historyKeyMatch) return

    this.routes = onGetRoutes(state.api.paths)
    this.checkStatusAndFetch()
  }

  render() {
    const {
      collection,
      filter,
      group,
      onGetRoutes,
      order,
      referencedField,
      sort,
      state
    } = this.props
    const documents = state.documents

    if (state.api.apis.length) {
      this.currentCollection = this.routes.getCurrentCollection(state.api.apis)
    }

    const createHref = this.routes.createRoute()

    if (documents.status === Constants.STATUS_NOT_FOUND) {
      return (
        <ErrorMessage
          type={Constants.ERROR_ROUTE_NOT_FOUND}
        />
      )      
    }

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
          {!referencedField && (
            <Button
              accent="save"
              href={createHref}
            >Create new document</Button>
          )}
        </HeroMessage>
      )
    }

    return this.renderDocumentList()
  }

  componentWillMount() {
    const {state, onGetRoutes} = this.props

    this.routes = onGetRoutes(state.api.paths)
    this.checkStatusAndFetch()
  }

  checkStatusAndFetch() {
    const {state} = this.props
    const {list, status} = state.documents

    // State check: reject when missing config, session, or apis
    if (!state.app.config || !state.api.apis.length || !state.user) return

    if (status === Constants.STATUS_IDLE) {
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
      onGetRoutes,
      order,
      page,
      documentId,
      referencedField,
      sort,
      state
    } = this.props
    const currentApi = getApiForUrlParams(state.api.apis, {
      collection,
      group
    })
    const currentCollection = this.routes.getCurrentCollection(state.api.apis)

    if (!currentCollection) {
      actions.setDocumentListStatus(Constants.STATUS_NOT_FOUND)

      return
    }

    const count = currentCollection.settings && currentCollection.settings.count || 20
    const filterValue = state.router.params ? state.router.params.filter : null
    const parentCollection = referencedField && this.routes.getParentCollection(state.api.apis)

    actions.fetchDocuments({
      api: currentApi,
      collection: currentCollection,
      count,
      filters: filterValue,
      page,
      documentId,
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
      documentId,
      group,
      onGetRoutes,
      referencedField,
      state
    } = this.props
    const editHref = this.routes.editRoute({
      documentId: documentId || data._id,
      referencedId: documentId ? data._id : null
    })
    const currentCollection = this.routes.getCurrentCollection(state.api.apis)
    const fieldSchema = currentCollection.fields[column.id]
    const renderedValue = this.renderField(column.id, fieldSchema, value)
    if (index === 0) {
      return (
        <a href={editHref}>{renderedValue}</a>
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
      onGetRoutes,
      onPageTitle,
      order,
      sort,
      state
    } = this.props
    const documents = state.documents.list.results
    const selectedRows = this.getSelectedRows()

    let selectLimit = Infinity

    // If we're on a reference field select view, we'll see if there's a field
    // component for the referenced field type that exports a `referenceSelect`
    // context. If it does, we'll use that instead of the default `SyncTable`
    // to render the results.
    if (referencedField) {
      const parentCollection = this.routes.getParentCollection(state.api.apis)
      const fieldSchema = parentCollection.fields[referencedField]
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
    const listableFields = filterHiddenFields(this.currentCollection.fields, 'list')

    const tableColumns = Object.keys(listableFields)
      .map(field => {
        if (!this.currentCollection.fields[field]) return

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
