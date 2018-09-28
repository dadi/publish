'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as Constants from 'lib/constants'
import * as documentsActions from 'actions/documentsActions'

import {buildUrl, createRoute, router} from 'lib/router'
import {connectHelper} from 'lib/util'
import {Format} from 'lib/util/string'

import Button from 'components/Button/Button'
import DocumentFilters from 'components/DocumentFilters/DocumentFilters'
import ListController from 'components/ListController/ListController'

/**
 * A controller bar for a list of documents.
 */
class DocumentListController extends Component {
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
     * The parent collection to operate on, when dealing with a reference field.
     */
    collectionParent: proptypes.object,

    /**
     * The JSON-stringified object of active filters.
     */
    filter: proptypes.string,

    /**
    * Whether we are editing a new filter.
    */
    newFilter: proptypes.bool,

    /**
    * Whether a new filter has been added.
    */
    onAddNewFilter: proptypes.func,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.state.forceNewFilters = 0
  }

  render() {
    const {
      api,
      collection,
      filter,
      group,
      newFilter,
      onAddNewFilter,
      onBuildBaseUrl,
      referencedField,
      state
    } = this.props
    const hasDocuments = state.documents.list &&
      state.documents.list.results &&
      state.documents.list.results.length > 0
    const params = state.router.search
    const filters = params && params.filter ? params.filter : null
    const filterLimitReached = filters 
      && collection 
      && Object.keys(filters).length === Object.keys(collection.fields).length
    const newHref = onBuildBaseUrl({
      createNew: true
    })

    if (!collection || state.documents.remoteError) {
      return null
    }

    let currentGroup = state.router.parameters &&
      state.router.parameters.group &&
      api.menu &&
      api.menu.find(item => {
        return Format.slugify(item.title) === state.router.parameters.group
      })

    return (
      <div>
        <ListController 
          breadcrumbs={[currentGroup && currentGroup.title, collection.name]}
        >
          <Button
            accent="data"
            disabled={filterLimitReached}
            onClick={this.handleAddNewFilter.bind(this)}
            type="fill"
          >Add Filter</Button>

          {!Boolean(referencedField) && (
            <Button
              accent="save"
              href={newHref}
              type="fill"
            >Create new</Button>
          )}
        </ListController>

        <DocumentFilters
          collection={collection}
          config={state.app.config}
          filters={filters}
          forceNewFilters={this.state.forceNewFilters}
          updateUrlParams={this.updateUrlParams.bind(this)}
        />
      </div>
    )
  }

  handleAddNewFilter() {
    const {forceNewFilters} = this.state

    this.setState({
      forceNewFilters: forceNewFilters + 1
    })
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
    app: state.app,
    documents: state.documents,
    router: state.router
  }),
  dispatch => bindActionCreators(documentsActions, dispatch)
)(DocumentListController)
