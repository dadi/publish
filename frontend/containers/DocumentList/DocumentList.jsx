'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as Constants from 'lib/constants'
import * as documentsActions from 'actions/documentsActions'

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {connectHelper, isValidJSON} from 'lib/util'
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
     * The name of the field currently being used to sort the documents.
     */
    sort: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object,

    /**
     * The order used to sort the documents by the `sort` field.
     */
    order: proptypes.oneOf(['asc', 'desc']),

    /**
     * The number of the current active page.
     */
    page: proptypes.number
  }

  constructor(props) {
    super(props)

    this.state = this.defaultLocalState()
  }

  componentDidUpdate(prevProps) {

    const {actions, state} = this.props
    const {list, status} = state.documents
    const pathKey = prevProps.state.router.locationBeforeTransitions.key
    const previousPathKey = state.router.locationBeforeTransitions.key
    const historyKeyMatch = pathKey === previousPathKey
    const apisWithoutCollections = state.api.apis.filter(api => !api.hasCollections).length

    if(prevProps.collection !== this.props.collection || prevProps.page !== this.props.page) {
      // Hard reset all state properties.
      this.setState(this.defaultLocalState())
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
      sort,
      state
    } = this.props
    const {selectedRows} = this.state
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const documents = state.documents

    if (!documents.list || documents.status === Constants.STATUS_LOADING || !currentCollection) {
      return null
    }

    const collectionFields = currentCollection.fields
    const tableColumns = Object.keys(this.filterHiddenFields(collectionFields))
      .map(field => {
        return {
          id: field,
          label: collectionFields[field].label
        }
      })
    const selectedDocuments = this.getSelectedDocuments()
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
            sortable={true}
            sortBy={sort}
            sortOrder={order}
          />
        )}
        <DocumentListToolbar
          collection={collection}
          group={group}
          metadata={metadata}
          onBulkAction={this.handleBulkAction.bind(this)}
          selectedDocuments={selectedDocuments}
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

  defaultLocalState() {
    return {
      selectedRows: {}
    }
  }

  componentWillUnmount() {
    const {actions} = this.props

    actions.clearDocumentList()
  }

  handleTableSort(value, sortBy, sortOrder) {
    return (
      <a href={createRoute({
        params: {sort: sortBy, order: sortOrder},
        update: true
      })}>{value}</a>
    )
  }

  handleAnchorRender(value, data, column, index) {
    const {
      collection,
      group,
      state
    } = this.props

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

  fetchDocuments() {
    const {
      actions,
      collection,
      filter,
      group,
      order,
      page,
      sort,
      state
    } = this.props

    const sortBy = sort || 'createdAt'
    const sortOrder = order || 'desc'
    const currentApi = getCurrentApi(state.api.apis, group, collection)
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const count = currentCollection.settings && currentCollection.settings.count || 20
    const filterValue = state.router.params ? state.router.params.filter : null
    const fieldsToFetch = Object.keys(this.filterHiddenFields(currentCollection.fields))

    // Set document loading status to 'Loading'
    actions.setDocumentListStatus(Constants.STATUS_LOADING)

    let query = APIBridge(currentApi)
      .in(currentCollection.name)
      .limitTo(count)
      .goToPage(page)
      .sortBy(sortBy, sortOrder)
      .where(filterValue)
      .useFields(fieldsToFetch)

    return query.find().then(docs => {
      // Update state with results.
      actions.setDocumentList(docs, query.query)
      // Update local selected state.
      this.setSelectedState(docs.results)

    }).catch(err => {
      console.log(err)
      // {!} TODO: Graceful deal with failure
    })
  }

  setSelectedState(documents) {
    const {state} = this.props
    const {selectedRows} = this.state
    const selectedDocuments = state.documents.selectedDocuments

    const matchingRows = Object.assign({}, ...documents
      .map((document, index) => {
        return {[index]: selectedDocuments.includes(document._id)}
      }))
    this.setState({selectedRows: matchingRows})
  }

  getSelectedDocuments() {
    const {state} = this.props
    const {selectedRows} = this.state
    const documents = state.documents.list.results
    const selectedDocuments = state.documents.selectedDocuments

    // Documents thqt match ID with a selected row.
    const localSelected = Object.keys(selectedRows)
      .filter(index => Boolean(selectedRows[index]))
      .map(index => documents[index] && documents[index]._id)

    // Documents that are selected in documents state.
    const stateSelected = documents
      .filter(document => selectedDocuments.includes(document._id))
      .map(document => document._id)

    // Force unique.
    return [...new Set([
      ...localSelected,
      ...stateSelected
    ])]
  }

  handleBulkAction(action) {
    const {state} = this.props
    console.log('(*) Selected documents:', state.documents.selectedDocuments)
  }

  handleRowSelect(selectedRows) {
    const {actions, state} = this.props
    const documents = state.documents.list.results
    const previousIDs = state.documents.selectedDocuments
    
    const toRemove = documents
      .filter((doc, ind) => !selectedRows[ind])
      .map(doc => doc._id)

    const toAdd = documents
      .filter((doc, ind) => selectedRows[ind])
      .map(doc => doc._id)

    const selectedIDs = [...previousIDs, ...toAdd]
      .filter(docID => toRemove.indexOf(docID) < 0)

    actions.setDocumentSelection(selectedIDs)

    this.setState({
      selectedRows: selectedRows
    })
  }


  filterHiddenFields(fields) {
    return Object.assign({}, ...Object.keys(fields)
      .filter(key => {
        // If the publish && display block don't exist, or if list is true allow this field to pass.
        return !fields[key].publish || !fields[key].publish.display || fields[key].publish.display.list
      }).map(key => {
        return {[key]: fields[key]}
      })
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    documents: state.documents,
    router: state.router,
    user: state.user
  }),
  dispatch => bindActionCreators(documentsActions, dispatch)
)(DocumentList)
