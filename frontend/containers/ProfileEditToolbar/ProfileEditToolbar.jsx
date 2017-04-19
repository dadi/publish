'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ProfileEditToolbar.css'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as userActions from 'actions/userActions'

import {bindActionCreators} from 'redux'
import {buildUrl} from 'lib/router'
import {connectHelper} from 'lib/util'
import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'
import {route} from 'preact-router'

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

  componentDidUpdate(prevProps, prevState) {
    const {
      dispatch,
      state
    } = this.props
    const {document, user} = state
    const previousDocument = prevProps.state.document
    const previousUser = prevProps.state.user
    const status = document.remoteStatus
    const wasSaving = previousDocument.remoteStatus === Constants.STATUS_SAVING

    // Have we just saved a document?
    if (wasSaving && (status === Constants.STATUS_IDLE)) {
      dispatch(actions.setNotification({
        message: 'Your profile has been updated'
      }))
    }

    // Are we trying to save the document?
    if (previousDocument.saveAttempts < document.saveAttempts) {
      this.saveUser()
    }    
  }

  render() {
    const {
      state
    } = this.props
    const document = state.document.remote
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
      && Object.keys(document.validationErrors)
        .filter(field => document.validationErrors[field])
        .length
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
