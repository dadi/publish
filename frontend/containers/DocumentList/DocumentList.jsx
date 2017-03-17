'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as Constants from 'lib/constants'
import * as documentsActions from 'actions/documentsActions'

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {connectHelper} from 'lib/util'
import {getCurrentApi, getCurrentCollection} from 'lib/app-config'

import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import SyncTable from 'components/SyncTable/SyncTable'
import SyncTableRow from 'components/SyncTable/SyncTableRow'

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
     * Whether to show the document list toolbar.
     */
    showToolbar: proptypes.bool,

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

  static defaultProps = {
    showToolbar: true
  }

  componentDidUpdate(previousProps) {
    const previousState = previousProps.state
    const previousStatePath = previousState.router.locationBeforeTransitions.pathname
    const previousStateSearch = previousState.router.locationBeforeTransitions.search

    const {actions, state} = this.props
    const {list, status} = state.documents

    const newStatePath = state.router.locationBeforeTransitions.pathname
    const newStateSearch = state.router.locationBeforeTransitions.search

    // State check: reject when missing config, session, or apis
    if (!state.app.config || !state.api.apis.length || !state.user) return

    // State check: reject when there are still APIs without collections
    const apisWithoutCollections = state.api.apis.filter(api => !api.collections).length

    if (apisWithoutCollections) return

    // State check: reject when path matches and document list loaded
    const pathKey = state.router.locationBeforeTransitions.key

    if (list && (typeof pathKey === 'undefined' || history.state.key === pathKey)) return

    // State check: reject when documents are still loading
    if (status === Constants.STATUS_LOADING) return

    this.fetchDocuments()
  }

  render() {
    const {
      collection,
      group,
      order,
      showToolbar,
      sort,
      state
    } = this.props
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const documents = state.documents

    if (!documents.list || documents.status === Constants.STATUS_LOADING || !currentCollection) {
      return null
    }

    const fieldsToDisplay = Object.keys(currentCollection.fields)
    const tableColumns = fieldsToDisplay.map(field => {
      return {
        id: field,
        label: currentCollection.fields[field].label
      }
    })

    return (
      <div>
        <SyncTable
          columns={tableColumns}
          sortable={true}
          sortBy={sort}
          sortOrder={order}
          sort={(value, sortBy, sortOrder) => {
            return (
              <a href={createRoute({
                params: {sort: sortBy, order: sortOrder},
                update: true
              })}>{value}</a>
            )
          }}
        >
          {documents.list.results.map(document => {
            return (
              <SyncTableRow
                data={document}
                renderCallback={(value, data, column, index) => {
                  if (index === 0) {
                    return (
                      <a href={buildUrl(group, collection, 'document/edit', data._id)}>{value}</a>
                    )
                  }

                  return value
                }}
              />
            )
          })}
        </SyncTable>
        
        {showToolbar && 
          <DocumentListToolbar
            collection={collection}
            group={group}
            metadata={documents.list.metadata}
          />
        }
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
      sort,
      state
    } = this.props

    const sortBy = sort || 'createdAt'
    const sortOrder = order || 'desc'
    const currentApi = getCurrentApi(state.api.apis, group, collection)
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const count = currentCollection.settings && currentCollection.settings.count || 20

    // Set document loading status to 'Loading'
    actions.setDocumentListStatus(Constants.STATUS_LOADING)

    let query = APIBridge(currentApi)
      .in(currentCollection.name)
      .limitTo(count)
      .goToPage(page)
      .sortBy(sortBy, sortOrder)

    if (filter && isValidJSON(filter)) {
      let filters = JSON.parse(this.props.filter)

      query.where(filters)
    }

    return query.find().then(docs => {
      // Update state with results
      actions.setDocumentList(docs)
    }).catch(err => {
      console.log(err)
      //actions.clearDocumentList()
      // {!} TODO: Graceful deal with failure
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...documentsActions}, dispatch)
)(DocumentList)
