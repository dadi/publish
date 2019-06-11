import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import * as userActions from 'actions/userActions'
import {connectRedux} from 'lib/redux'
import Button from 'components/Button/Button'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DateTime from 'components/DateTime/DateTime'
import React from 'react'
import styles from './MediaEditToolbar.css'
import Toolbar from 'components/Toolbar/Toolbar'

/**
 * A toolbar used in a media edit view.
 */
class MediaEditToolbar extends React.Component {
  componentDidUpdate(prevProps) {
    const {actions, onBuildBaseUrl, state} = this.props
    const {document, documents} = state
    const {
      document: previousDocument,
      documents: previousDocuments
    } = prevProps.state
    const wasFirstValidated =
      !previousDocument.hasBeenValidated && document.hasBeenValidated

    // Have we just saved a document?
    if (previousDocument.isSaving && !document.isSaving) {
      if (this.onSave && typeof this.onSave.callback === 'function') {
        this.onSave.callback(
          state.document.remote ? state.document.remote._id : null
        )
      }
    }

    // Are we trying to save the document?
    if (
      previousDocument.saveAttempts < document.saveAttempts ||
      (wasFirstValidated && document.saveAttempts > 0)
    ) {
      this.saveDocument()
    }

    // Have we deleted a document?
    if (previousDocuments.isDeleting && !documents.isDeleting) {
      // Redirect to document list view.
      route(
        onBuildBaseUrl({
          documentId: null
        })
      )

      let message =
        previousDocuments.isDeleting > 1
          ? 'The documents have been deleted'
          : 'The document has been deleted'

      actions.setNotification({
        message
      })
    }
  }

  handleDelete() {
    const {actions, api, collection, state} = this.props
    const document = state.document.remote

    actions.deleteMedia({
      api,
      ids: [document._id]
    })
  }

  handleSave(saveMode) {
    const {actions, documentId, onBuildBaseUrl, section, state} = this.props
    const newDocument = !Boolean(documentId)

    this.onSave = {
      callback: documentId => {
        if (!documentId) {
          actions.setNotification({
            message: `Document failed to save`
          })

          return
        }

        actions.setNotification({
          message: `The document has been ${
            newDocument ? 'created' : 'updated'
          }`
        })
      }
    }

    actions.registerSaveAttempt(saveMode)
  }

  render() {
    const {api, documentId, multiLanguage, state} = this.props
    const {isSaving, remote: document} = state.document || {}
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK

    return (
      <Toolbar>
        <div className={styles.metadata}>
          {document && document._createdAt && (
            <p>
              <span>Created </span>

              {document._createdBy && (
                <span>
                  by <strong>{document._createdBy}</strong>{' '}
                </span>
              )}

              <DateTime date={document._createdAt} relative={true} />
            </p>
          )}

          {document && document._lastModifiedAt && (
            <p className={styles['metadata-emphasis']}>
              <span>Last updated </span>

              {document._lastModifiedBy && (
                <span>
                  by <strong>{document._lastModifiedBy}</strong>{' '}
                </span>
              )}

              <DateTime date={document._lastModifiedAt} relative={true} />
            </p>
          )}
        </div>

        <div className={styles.buttons}>
          {document && (
            <div className={styles.button}>
              <ButtonWithPrompt
                accent="destruct"
                className={styles.button}
                disabled={hasConnectionIssues}
                onClick={this.handleDelete.bind(this)}
                promptCallToAction="Yes, delete it."
                position="left"
                promptMessage="Are you sure you want to delete this document?"
              >
                Delete
              </ButtonWithPrompt>
            </div>
          )}

          <div className={styles.button}>
            <Button
              accent="save"
              disabled={hasConnectionIssues || isSaving}
              isLoading={isSaving}
              onClick={this.handleSave.bind(this)}
            >
              Save
            </Button>
          </div>
        </div>
      </Toolbar>
    )
  }

  saveDocument() {
    const {actions, api, documentId, state} = this.props
    const {hasBeenValidated, local: document} = state.document

    if (!hasBeenValidated) return

    actions.saveMedia({
      api,
      document,
      documentId
    })
  }

  shouldComponentUpdate(nextProps) {
    const {state} = this.props
    const {state: nextState} = nextProps

    // Avoid a re-render if the user is in the process of signing out.
    if (state.user.isSignedIn && !nextState.user.isSignedIn) {
      return false
    }

    return true
  }
}

export default connectRedux(appActions, documentActions, userActions)(
  MediaEditToolbar
)
