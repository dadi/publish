'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as Constants from 'lib/constants'
import * as mediaActions from 'actions/mediaActions'

import {buildUrl, createRoute, router} from 'lib/router'
import {connectHelper} from 'lib/util'
import {Format} from 'lib/util/string'

import Button from 'components/Button/Button'
import MediaFilters from 'components/MediaFilters/MediaFilters'
import ListController from 'components/ListController/ListController'

/**
 * A controller bar for a list of media.
 */
class MediaListController extends Component {
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
     * The name of the group where the current bucket belongs (if any).
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
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {
      bucket,
      filter,
      group,
      newFilter,
      onAddNewFilter,
      onBuildBaseUrl,
      referencedField,
      state
    } = this.props
    const {currentApi, currentBucket} = state.api
    const hasMedias = state.media.list &&
      state.media.list.results &&
      state.media.list.results.length > 0
    const isReference = referencedField // Temporary to disable create new in reference fields until reference save is ready.
    const params = state.router.search
    const filters = params && params.filter ? params.filter : null
    const filterLimitReached = filters 
      && currentBucket 
      && Object.keys(filters).length === Object.keys(currentBucket.fields).length
    const newHref = onBuildBaseUrl({
      createNew: true
    })

    if (!currentBucket || state.media.remoteError) {
      return null
    }

    let currentGroup = state.router.parameters &&
      state.router.parameters.group &&
      state.api.currentApi.menu &&
      state.api.currentApi.menu.find(item => {
        return Format.slugify(item.title) === state.router.parameters.group
      })

    return (
      <div>
        <ListController 
          breadcrumbs={[currentGroup && currentGroup.title, currentBucket.name]}
        >
          <Button
            type="fill"
            disabled={filterLimitReached}
            accent="data"
            onClick={this.handleAddNewFilter.bind(this)}
          >Add Filter</Button>
          {!currentBucket._isAuthBucket && !isReference && (
            <Button
              type="fill"
              accent="save"
              href={newHref}
            >Create new</Button>
          )}
        </ListController>
        <MediaFilters
          config={state.app.config}
          filters={filters}
          newFilter={newFilter}
          bucket={currentBucket}
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
    const {bucket, group, metadata} = this.props
    const inputValue = event.target.value
    const parsedValue = parseInt(inputValue)

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== inputValue) || (parsedValue <= 0)) return

    // If the number inserted is outside the range of the pages available,
    // we return.
    if (parsedValue > metadata.totalPages) return

    route(buildUrl(group, bucket, 'media', parsedValue))
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
    media: state.media,
    router: state.router
  }),
  dispatch => bindActionCreators(mediaActions, dispatch)
)(MediaListController)
