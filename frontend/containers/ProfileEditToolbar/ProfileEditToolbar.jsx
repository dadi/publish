'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ProfileEditToolbar.css'

import * as Constants from 'lib/constants'
import {Keyboard} from 'lib/keyboard'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as userActions from 'actions/userActions'

import {bindActionCreators} from 'redux'
import {buildUrl} from 'lib/router'
import {connectHelper} from 'lib/util'
import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'
import {route} from 'preact-router-regex'

import Button from 'components/Button/Button'
import ButtonWithOptions from 'components/ButtonWithOptions/ButtonWithOptions'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DateTime from 'components/DateTime/DateTime'
import Peer from 'components/Peer/Peer'
import Toolbar from 'components/Toolbar/Toolbar'

const actions = {
  ...appActions,
  ...documentActions,
  ...userActions
}

/**
 * A toolbar used in a document edit view.
 */
class ProfileEditToolbar extends Component {
  static propTypes = {
    /**
     * The name of the collection currently being listed.
     */
    collection: proptypes.string,

    /**
     * The global actions dispatcher.
     */
    dispatch: proptypes.func,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * The name of the group where the current collection belongs (if any).
     */
    group: proptypes.string,

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
  }

  componentDidMount() {
    this.keyboard.on('cmd+s').do(this.handleSave.bind(this, 'save'))
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      dispatch,
      state
    } = this.props
    const {document, user} = state
    const previousDocument = prevProps.state.document
    const previousUser = prevProps.state.user
    const status = document.remoteStatus
    const wasFirstValidated = !previousDocument.validationErrors && document.validationErrors
    const wasSaving = previousDocument.remoteStatus === Constants.STATUS_SAVING

    // Have we just saved?
    if (wasSaving && (status === Constants.STATUS_IDLE)) {
      dispatch(actions.setNotification({
        message: 'Your profile has been updated'
      }))
    }

    // Are we trying to save?
    if ((previousDocument.saveAttempts < document.saveAttempts) ||
        (wasFirstValidated && document.saveAttempts > 0)) {
      this.saveUser()
    }    
  }

  render() {
    const {
      state
    } = this.props
    const document = state.document.remote
    const validationErrors = state.document.validationErrors
    const hasValidationErrors = validationErrors && Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length

    return (
      <Toolbar>
        <div class={styles.container}>
          <Button
            accent="save"
            disabled={hasValidationErrors}
            onClick={this.handleSave.bind(this)}
          >Save settings</Button>
        </div>
      </Toolbar>
    )
  }

  componentWillUnmount() {
    this.keyboard.off()
  }

  handleSave() {
    const {dispatch} = this.props

    dispatch(actions.registerSaveAttempt())
  }

  saveUser() {
    const {
      dispatch,
      state
    } = this.props
    const validationErrors = state.document.validationErrors
    const hasValidationErrors = !validationErrors || Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length

    if (hasValidationErrors) return

    const currentApi = getApiForUrlParams(state.api.apis, {
      collection: Constants.AUTH_COLLECTION
    })
    const currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection: Constants.AUTH_COLLECTION,
      useApi: currentApi
    })

    dispatch(actions.saveUser({
      api: currentApi,
      collection: currentCollection,
      user: state.document.local
    }))
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    document: state.document,
    user: state.user
  })
)(ProfileEditToolbar)
