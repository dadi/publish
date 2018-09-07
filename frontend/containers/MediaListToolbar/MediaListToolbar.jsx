'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './MediaListToolbar.css'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as mediaActions from 'actions/mediaActions'
import * as mediaActions from 'actions/mediaActions'

import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'
import {Format} from 'lib/util/string'
import {route} from '@dadi/preact-router'

import Button from 'components/Button/Button'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import Checkbox from 'components/Checkbox/Checkbox'
import Paginator from 'components/Paginator/Paginator'
import Toolbar from 'components/Toolbar/Toolbar'
import ToolbarTextInput from 'components/Toolbar/ToolbarTextInput'

/**
 * A toolbar used in a media list view.
 */
class MediaListToolbar extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The name of the bucket being used.
     */
    bucket: proptypes.string,

    /**
     * The name of the group where the current bucket belongs (if any).
     */
    group: proptypes.string,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * The name of a reference field currently being edited.
     */
    referencedField: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.BULK_ACTIONS_PLACEHOLDER = 'BULK_ACTIONS_PLACEHOLDER'
    this.state.bulkActionSelected = this.BULK_ACTIONS_PLACEHOLDER
  }

  componentDidUpdate(prevProps, prevState) {
    const {actions, state} = this.props
    const {isDeleting, list} = state.media
    const wasDeleting = prevProps.state.media.isDeleting

    // Have we just deleted some media?
    if (wasDeleting && !isDeleting) {
      let message = wasDeleting > 1 ?
        `${wasDeleting} media have been deleted` :
        'The media has been deleted'

      actions.setNotification({
        message
      })
    }
  }

  render() {
    const {
      bucket,
      group,
      onBuildBaseUrl,
      referencedField,
      state
    } = this.props
    const mediaList = state.media.list

    if (!mediaList) return null

    const {metadata} = mediaList

    return (
      <Toolbar>
        <div class={styles.section}>
          <div class={styles.information}>
            {metadata.totalCount > metadata.limit && (
              <span class={styles['page-input']}>
                <ToolbarTextInput
                  onChange={this.handleGoToPage.bind(this)}
                  size="small"
                  placeholder="Go to page"
                />
              </span>
            )}
            {metadata.totalCount > 1 && (
              <span class={styles['count-label']}>
                <span>Showing </span>
                <strong>{`${metadata.offset + 1}-${Math.min(metadata.offset + metadata.limit, metadata.totalCount)} `}</strong>
                of <strong>{metadata.totalCount}</strong>
              </span>
            )}   
          </div>
        </div>

        <div class={styles.section}>
          <Paginator
            currentPage={metadata.page}
            linkCallback={this.handleBuildPageUrl.bind(this)}
            maxPages={8}
            totalPages={metadata.totalPages}
          />
        </div>

        <div class={styles.section}>
          {Boolean(referencedField)
            ? this.renderReferencedMediaActions()
            : this.renderBulkActions()
          }
        </div>
      </Toolbar>
    )
  }

  renderBulkActions() {
    const {bulkActionSelected} = this.state
    const {state} = this.props
    const selectedMedias = state.media.selected

    return (
      <div class={styles.actions}>
        <select
          class={styles.select}
          onChange={this.handleBulkActionSelect.bind(this)}
          value={bulkActionSelected}
        >
          <option disabled value={this.BULK_ACTIONS_PLACEHOLDER}>With selected...</option>
          <option value="delete">Delete</option>
        </select>

        <ButtonWithPrompt
          accent="data"
          className={styles['select-button']}
          disabled={(bulkActionSelected === this.BULK_ACTIONS_PLACEHOLDER) || !selectedMedias.length}
          onClick={this.handleBulkActionApply.bind(this)}
          promptCallToAction="Yes, delete them."
          promptMessage="Are you sure you want to delete the selected media?"
          size="small"
        >Apply</ButtonWithPrompt>
      </div>
    )
  }

  renderReferencedMediaActions() {
    const {state} = this.props
    const selectedMedias = state.media.selected
    const ctaText = selectedMedias.length > 1 ?
      'Add selected media' : 'Add selected media'

    return (
      <div class={styles.actions}>
        <Button
          accent="save"
          disabled={!selectedMedias.length}
          onClick={this.handleReferencedMediaSelect.bind(this)}
        >{ctaText}</Button>
      </div>
    )
  }

  handleBuildPageUrl(page) {
    const {
      onBuildBaseUrl,
      referencedField
    } = this.props

    return onBuildBaseUrl({
      referenceFieldSelect: referencedField
    })
  }

  handleBulkActionApply(actionType) {
    const {bulkActionSelected} = this.state
    const validBulkActionSelected = bulkActionSelected &&
      (bulkActionSelected !== this.BULK_ACTIONS_PLACEHOLDER)

    if (!validBulkActionSelected) return

    const {
      actions,
      bucket,
      group,
      state
    } = this.props
    const {currentApi, currentBucket} = state.api

    if (bulkActionSelected === 'delete') {
      actions.deleteMedias({
        api: currentApi,
        bucket: currentBucket,
        ids: state.media.selected
      })
    }
  }

  handleBulkActionSelect(event) {
    this.setState({
      bulkActionSelected: event.target.value
    })
  }

  handleGoToPage(event) {
    const {
      bucket,
      group,
      onBuildBaseUrl,
      state
    } = this.props
    const mediaList = state.media.list
    const {metadata} = mediaList
    const inputValue = event.target.value
    const parsedValue = parseInt(inputValue)

    if (!mediaList) return null

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== inputValue) || (parsedValue <= 0)) return

    // If the number inserted is outside the range of the pages available,
    // we return.
    if (parsedValue > metadata.totalPages) return

    route(this.handleBuildPageUrl(parsedValue))
  }

  handleReferencedMediaSelect() {
    const {
      actions,
      bucket,
      group,
      onBuildBaseUrl,
      parentMediaId,
      referencedField,
      state
    } = this.props
    const mediaList = state.media.list.results
    const {currentParentBucket} = state.api

    // We might want to change this when we allow a field to reference multiple
    // media. For now, we just get the first selected media.
    const selectedMedias = state.media.selected.map(mediaId => {
      return mediaList.find(media => {
        return media._id === mediaId
      })
    }).filter(Boolean)

    actions.updateLocalMedia({
      [referencedField]: selectedMedias
    }, {
      bucket,
      group
    })

    let redirectUrl = onBuildBaseUrl({
      createNew: !Boolean(state.router.parameters.mediaId)
    })

    route(redirectUrl)
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    media: state.media,
    router: state.router
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...mediaActions,
    ...mediaActions
  }, dispatch)
)(MediaListToolbar)
