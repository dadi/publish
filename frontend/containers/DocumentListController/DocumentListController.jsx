'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as Constants from 'lib/constants'
import * as documentsActions from 'actions/documentsActions'

import {buildUrl, createRoute, router} from 'lib/router'
import {connectHelper} from 'lib/util'

import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'

import Button from 'components/Button/Button'
import DocumentFilters from 'components/DocumentFilters/DocumentFilters'
import ListController from 'components/ListController/ListController'

/**
 * A controller bar for a list of documents.
 */
class DocumentListController extends Component {
  static propTypes = {
    /**
     * The JSON-stringified object of active filters.
     */
    filter: proptypes.string,

    /**
    * Whether we are editing a new filter.
    */
    newFilter: proptypes.bool,

    /**
     * The name of the group where the current collection belongs (if any).
     */
    group: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object,

    /**
    * Whether a new filter has been added.
    */
    onAddNewFilter: proptypes.func,

    /**
    * A callback to be used to obtain the sibling document routes (edit, create and list), as
    * determined by the view.
    */
    onGetRoutes: proptypes.func
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {
      collection,
      filter,
      group,
      newFilter,
      onAddNewFilter,
      onGetRoutes,
      referencedField,
      state
    } = this.props
    
    const routes = onGetRoutes(state.api.paths)
    const currentCollection = state.api.apis.length && routes.getCurrentCollection(state.api.apis)
    
    const hasDocuments = state.documents.list && state.documents.list.results && (state.documents.list.results.length > 0)
    const isReference = referencedField // Temporary to disable create new in reference fields until reference save is ready.
    const params = state.router.params
    const filters = params && params.filter ? params.filter : null
    const filterLimitReached = filters 
      && currentCollection 
      && Object.keys(filters).length === Object.keys(currentCollection.fields).length

    const newHref = onGetRoutes(state.api.paths).createRoute({pos: 1}) // TO-DO: Change pos to match the number of new entries.

    if (!currentCollection) {
      return null
    }

    const collectionMatch = routes.getCollectionMatch(collection)
    const api = routes.getAPI(state.api.apis, collectionMatch, group)
    const menu = routes.menuMatch(api, group, currentCollection)

    let groupName = null
    if (menu && menu.length)
      groupName = menu[0].title

    return (
      <div>
        <ListController 
          collection={currentCollection.name}
        >
          <Button
            type="fill"
            disabled={filterLimitReached}
            accent="data"
            onClick={this.handleAddNewFilter.bind(this)}
          >Add Filter</Button>
          {!currentCollection._isAuthCollection && !isReference && (
            <Button
              type="fill"
              accent="save"
              href={newHref}
            >Create new</Button>
          )}
        </ListController>
        <DocumentFilters
          config={state.app.config}
          filters={filters}
          newFilter={newFilter}
          collection={currentCollection}
          updateUrlParams={this.updateUrlParams.bind(this)}
        />
      </div>
    )
  }

  handleAddNewFilter() {
    const {onAddNewFilter} = this.props
    onAddNewFilter(true)
  }

  handleGoToPage(event) {
    const {collection, group, metadata} = this.props
    const inputValue = event.target.value
    const parsedValue = parseInt(inputValue)

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== inputValue) || (parsedValue <= 0)) return

    // If the number inserted is outside the range of the pages available,
    // we return.
    if (parsedValue > metadata.totalPages) return

    route(buildUrl(group, collection, 'documents', parsedValue))
  }

  updateUrlParams(filters) {
    const {actions, onAddNewFilter, state} = this.props
    
    // Replace existing filters
    router({params: {filter: filters}, update: true})
    onAddNewFilter(false)
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    documents: state.documents,
    router: state.router
  }),
  dispatch => bindActionCreators(documentsActions, dispatch)
)(DocumentListController)
