'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as Constants from 'lib/constants'
import * as documentsActions from 'actions/documentsActions'

import {buildUrl, createRoute, router} from 'lib/router'
import {connectHelper} from 'lib/util'
import {getCurrentApi, getCurrentCollection} from 'lib/app-config'

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
     * The name of the group where the current collection belongs (if any).
     */
    group: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  render() {
    const {
      collection,
      filter,
      group,
      state
    } = this.props
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const hasDocuments = state.documents.list && state.documents.list.results && (state.documents.list.results.length > 0)
    const hasQuery = Boolean(state.documents.query)
    const filters = state.router.params ? state.router.params.filter : null

    if (!currentCollection || !hasDocuments && !hasQuery) {
      return null
    }

    return (
      <div>
        <ListController collection={currentCollection}>
          <Button
            accent="data"
          >Add Filter</Button>
          <Button
            accent="save"
            href={buildUrl(group, collection, 'document', 'new')}
          >Create new</Button>
        </ListController>
        <DocumentFilters
          filters={filters}
          collection={currentCollection}
          updateUrlParams={this.updateUrlParams.bind(this)}
        />
      </div>
    )
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
    const {actions, state} = this.props
    
    // Replace existing filters
    router({params: {filter: filters}, update: true})
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    documents: state.documents,
    router: state.router
  }),
  dispatch => bindActionCreators(documentsActions, dispatch)
)(DocumentListController)
