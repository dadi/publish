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
     * Whether the list of filters should be visible.
     */
    filtersVisible: proptypes.bool,

    /**
     * The name of the group where the current collection belongs (if any).
     */
    group: proptypes.string,

    /**
     * A callback to be executed when the "Filters" button is pressed.
     */
    onFiltersToggle: proptypes.func,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  render() {
    const {
      collection,
      filter,
      filtersVisible,
      group,
      onFiltersToggle,
      state
    } = this.props
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const hasDocuments = state.documents.list && state.documents.list.results && (state.documents.list.results.length > 0)

    if (!currentCollection || !hasDocuments) {
      return null
    }

    return (
      <div>
        <ListController collection={currentCollection}>
          <Button
            accent="data"
            onClick={onFiltersToggle}
          >Filters</Button>
          <Button
            accent="save"
            href={buildUrl(group, collection, 'document', 'new')}
          >Create new</Button>
        </ListController>

        <div style={!filtersVisible && "display: none;"}>
          <DocumentFilters
            filter={filter}
            collection={currentCollection}
            updateUrlParams={this.updateUrlParams.bind(this)}
          />
        </div>
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
  state => state,
  dispatch => bindActionCreators({...documentsActions}, dispatch)
)(DocumentListController)
