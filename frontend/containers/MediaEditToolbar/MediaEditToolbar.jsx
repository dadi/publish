'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './MediaEditToolbar.css'

import * as Constants from 'lib/constants'
import {Keyboard} from 'lib/keyboard'
import * as appActions from 'actions/appActions'
import * as mediaActions from 'actions/mediaActions'
import * as mediaActions from 'actions/mediaActions'

import {bindActionCreators} from 'redux'
import {buildUrl} from 'lib/router'
import {connectHelper} from 'lib/util'
import {route} from '@dadi/preact-router'

import ButtonWithOptions from 'components/ButtonWithOptions/ButtonWithOptions'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DateTime from 'components/DateTime/DateTime'
import DropdownNative from 'components/DropdownNative/DropdownNative'
import Peer from 'components/Peer/Peer'
import Toolbar from 'components/Toolbar/Toolbar'

/**
 * A toolbar used in a media edit view.
 */
class MediaEditToolbar extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The name of the bucket currently being listed.
     */
    bucket: proptypes.string,

    /**
     * The ID of the media being edited.
     */
    mediaId: proptypes.string,

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
     * The current active section (if any).
     */
    section: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)
    
    this.keyboard = new Keyboard()
    this.onSave = null
  }

  componentDidMount() {
    this.keyboard.on('cmd+s').do(this.handleSave.bind(this, 'save'))
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      actions,
      bucket,
      group,
      state
    } = this.props
    const media = state.media
    const previousMedia = prevProps.state.media
    const wasFirstValidated = !previousMedia.hasBeenValidated &&
      media.hasBeenValidated

    // Have we just saved a media?
    if (previousMedia.isSaving && !media.isSaving) {
      if (typeof this.onSave.callback === 'function') {
        this.onSave.callback(state.media.remote ? state.media.remote._id : null)
      }
    }

    // Are we trying to save the media?
    if (
      previousMedia.saveAttempts < media.saveAttempts ||
      wasFirstValidated && media.saveAttempts > 0
    ) {
      this.saveMedia()
    }

    // Have we deleted a media?
    if (previousMedia.remote && !media.remote) {
      // Redirect to media list view
      route(buildUrl(group, bucket))

      actions.setNotification({
        message: 'The media have been deleted'
      })
    }
  }

  render() {
    const {
      mediaId,
      state
    } = this.props
    const {
      isSaving,
      peers,
      remote: media
    } = state.media || {}
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
    const validationErrors = state.media.validationErrors
    const hasValidationErrors = validationErrors && Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length
    const method = mediaId ? 'edit' : 'new'

    // By default, we support these two save modes.
    let saveOptions = {
      'Save and create new': this.handleSave.bind(this, 'saveAndCreateNew'),
      'Save and go back': this.handleSave.bind(this, 'saveAndGoBack')
    }

    // If we're editing an existing media, we also allow users to duplicate
    // the media.
    if (method === 'edit') {
      saveOptions['Save as duplicate'] = this.handleSave.bind(this, 'saveAsDuplicate')
    }

    let languages = Boolean(state.api.currentApi) &&
      Boolean(state.api.currentApi.languages) &&
      (state.api.currentApi.languages.length > 1) &&
      state.api.currentApi.languages.reduce((languagesObject, language) => {
        languagesObject[language.code] = language.name

        return languagesObject
      }, {})
    let currentLanguage = state.router.search.lang

    // No language is selected, so we'll set the value of the dropdown to the
    // value of the default language.
    if (languages && !currentLanguage) {
      let defaultLanguage = state.api.currentApi.languages.find(language => {
        return Boolean(language.default)
      })

      currentLanguage = defaultLanguage && defaultLanguage.code
    }

    return (
      <Toolbar>
        {peers && (peers.length > 0) &&
          <div class={styles.peers}>
            {peers.map(peer => (
              <Peer peer={peer} />
            ))}
          </div>
        }

        {languages && (
          <DropdownNative
            onChange={this.handleLanguageChange.bind(this)}
            options={languages}
            value={currentLanguage}
          />
        )}

        <div class={styles.metadata}>
          {media && media._createdAt &&
            <p>
              <span>Created </span>
              <DateTime
                date={media._createdAt}
                relative={true}
              />
            </p>
          }

          {media && media._lastModifiedAt &&
            <p class={styles['metadata-emphasis']}>
              <span>Last updated </span>
              <DateTime
                date={media._lastModifiedAt}
                relative={true}
              />
            </p>
          }
        </div>

        <div class={styles.buttons}>
          {media && (
            <div class={styles.button}>
              <ButtonWithPrompt
                accent="destruct"
                className={styles.button}
                disabled={hasConnectionIssues}
                onClick={this.handleDelete.bind(this)}
                promptCallToAction="Yes, delete it."
                position="left"
                promptMessage="Are you sure you want to delete this media?"
              >Delete</ButtonWithPrompt> 
            </div>
          )}

          <div class={styles.button}>
            <ButtonWithOptions
              accent="save"
              disabled={hasConnectionIssues || hasValidationErrors || isSaving}
              onClick={this.handleSave.bind(this, 'save')}
              options={saveOptions}
            >
              Save and continue
            </ButtonWithOptions>
          </div>
        </div>
      </Toolbar>
    )
  }

  componentWillUnmount() {
    this.keyboard.off()
  }

  handleDelete() {
    const {
      actions,
      bucket,
      group,
      referencedField,
      state
    } = this.props
    const {currentApi, currentBucket} = state.api
    const media = state.media.remote

    if (media._id) {
      actions.deleteMedias({
        api: currentApi,
        bucket: currentBucket,
        ids: [media._id]
      })
    }
  }

  handleLanguageChange(newLanguage) {
    const {actions, onBuildBaseUrl} = this.props

    let languageUrl = onBuildBaseUrl({
      search: {
        lang: newLanguage
      }
    })

    route(languageUrl)
  }

  handleSave(saveMode) {
    const {
      actions,
      bucket,
      group,
      onBuildBaseUrl,
      section,
      state
    } = this.props
    const newMedia = !Boolean(this.props.mediaId)

    switch (saveMode) {
      // Save
      case 'save':
        this.onSave = {
          callback: mediaId => {
            if (!mediaId) {
              actions.setNotification({
                message:`Media failed to save`
              }) 
              return
            }

            let newUrl = onBuildBaseUrl({
              mediaId
            })
            
            route(newUrl)

            actions.setNotification({
              message:`The media has been ${newMedia ? 'created' : 'updated'}`
            })
          }
        }

        break

      // Save and create new
      case 'saveAndCreateNew':
        this.onSave = {
          callback: mediaId => {
            let newUrl = onBuildBaseUrl({
              createNew: true,
              section: null
            })

            route(newUrl)

            actions.setNotification({
              message: `The media has been ${newMedia ? 'created' : 'updated'}`
            })

            actions.clearRemoteMedia()
          }
        }

        break

      // Save and go back
      case 'saveAndGoBack':
        this.onSave = {
          callback: mediaId => {
            let newUrl = onBuildBaseUrl({
              mediaId: null,
              section: null
            })

            route(newUrl)

            actions.setNotification({
              message: `The media has been ${newMedia ? 'created' : 'updated'}`
            })
          }
        }

        break

      // Save as duplicate
      case 'saveAsDuplicate':
        this.onSave = {
          callback: mediaId => {
            let newUrl = onBuildBaseUrl({
              mediaId
            })

            route(newUrl)

            actions.setNotification({
              message: `The media has been created`
            })
          },
          createNew: true
        }

        break
    }    

    actions.registerSaveAttempt()
  }

  saveMedia() {
    const {
      actions,
      bucket,
      mediaId,
      group,
      referencedField,
      state
    } = this.props
    const creatingNew = this.onSave && this.onSave.createNew
    const validationErrors = state.media.validationErrors
    const hasValidationErrors = !validationErrors || Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length

    if (hasValidationErrors) return

    let media = state.media.local

    // If we're creating a new media, we need to inject any required Boolean
    // fields.
    if (creatingNew) {
      media = Object.assign({}, state.media.remote, state.media.local)
    }

    actions.saveMedia({
      api: state.api.currentApi,
      bucket: state.api.currentBucket,
      media,
      mediaId: creatingNew ? null : mediaId,
      group,
      urlBucket: bucket
    })
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    media: state.media,
    router: state.router
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...mediaActions,
    ...mediaActions
  }, dispatch)
)(MediaEditToolbar)
