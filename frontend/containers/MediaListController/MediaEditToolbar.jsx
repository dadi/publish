'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './MediaEditToolbar.css'

import * as Constants from 'lib/constants'
import {Keyboard} from 'lib/keyboard'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'
import * as userActions from 'actions/userActions'

import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import ButtonW from 'components/ButtonW/ButtonW'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DateTime from 'components/DateTime/DateTime'
import Toolbar from 'components/Toolbar/Toolbar'
  
/**
 * A toolbar used in a document edit view.
 */
class MediaEditToolbar extends Component {
  static propTypes = {}

  constructor(props) {
    super(props)
    
    this.keyboard = new Keyboard()
  }

  componentDidMount() {
    this.keyboard.on('cmd+s').do(this.handleSave.bind(this, 'save'))
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      actions,
      onBuildBaseUrl,
      state
    } = this.props
    const {
      document,
      documents
    } = state
    const {
      document: previousDocument,
      documents: previousDocuments
    } = prevProps.state
    const wasFirstValidated = !previousDocument.hasBeenValidated &&
      document.hasBeenValidated

    // Have we just saved a document?
    if (previousDocument.isSaving && !document.isSaving) {
      if (this.onSave && typeof this.onSave.callback === 'function') {
        this.onSave.callback(state.document.remote ? state.document.remote._id : null)
      }
    }

    // Are we trying to save the document?
    if (
      previousDocument.saveAttempts < document.saveAttempts ||
      wasFirstValidated && document.saveAttempts > 0
    ) {
      this.saveDocument()
    }

    // Have we deleted a document?
    if (previousDocuments.isDeleting && !documents.isDeleting) {
      // Redirect to document list view.
      route(onBuildBaseUrl({
        documentId: null
      }))

      let message = previousDocuments.isDeleting > 1 ?
        'The documents have been deleted' :
        'The document has been deleted'

      actions.setNotification({
        message
      })
    }
  }

  componentWillUnmount() {
    this.keyboard.off()
  }

  handleDelete() {
    const {
      actions,
      api,
      collection,
      referencedField,
      state
    } = this.props
    const document = state.document.remote

    if (document._id) {
      actions.deleteDocuments({
        api,
        collection,
        ids: [document._id]
      })
    }
  }

  handleSave(saveMode) {
    const {
      actions,
      documentId,
      onBuildBaseUrl,
      section,
      state
    } = this.props
    const newDocument = !Boolean(documentId)

    this.onSave = {
      callback: documentId => {
        if (!documentId) {
          actions.setNotification({
            message:`Document failed to save`
          }) 
          return
        }

        let newUrl = onBuildBaseUrl({
          documentId
        })
        
        route(newUrl)

        actions.setNotification({
          message:`The document has been ${newDocument ? 'created' : 'updated'}`
        })
      }
    }    

    actions.registerSaveAttempt(saveMode)
  }  

  render() {
    const {
      api,
      documentId,
      multiLanguage,
      state
    } = this.props
    const {
      isSaving,
      peers,
      remote: document
    } = state.document || {}
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
    const validationErrors = state.document.validationErrors
    const hasValidationErrors = validationErrors && Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length

    return (
      <Toolbar>
        <div class={styles.metadata}>
          {document && document._createdAt &&
            <p>
              <span>Created </span>

              {document._createdBy &&
                <span>by <strong>{document._createdBy}</strong> </span>
              }

              <DateTime
                date={document._createdAt}
                relative={true}
              />
            </p>
          }

          {document && document._lastModifiedAt &&
            <p class={styles['metadata-emphasis']}>
              <span>Last updated </span>

              {document._lastModifiedBy &&
                <span>by <strong>{document._lastModifiedBy}</strong> </span>
              }

              <DateTime
                date={document._lastModifiedAt}
                relative={true}
              />
            </p>
          }
        </div>

        <div class={styles.buttons}>
          {document && (
            <div class={styles.button}>
              <ButtonWithPrompt
                accent="destruct"
                className={styles.button}
                disabled={hasConnectionIssues}
                onClick={this.handleDelete.bind(this)}
                promptCallToAction="Yes, delete it."
                position="left"
                promptMessage="Are you sure you want to delete this document?"
              >Delete</ButtonWithPrompt> 
            </div>
          )}

          <div class={styles.button}>
            <Button
              accent="save"
              disabled={hasConnectionIssues || hasValidationErrors || isSaving}
              isLoading={isSaving}
              onClick={this.handleSave.bind(this, saveOptions.primary.action)}
            >{saveOptions.primary.label}</Button>
          </div>
        </div>
      </Toolbar>
    )
  }

  saveDocument() {
    const {
      actions,
      api,
      collection,
      documentId,
      group,
      referencedField,
      state
    } = this.props
    const creatingNew = this.onSave && this.onSave.createNew
    const {hasBeenValidated, validationErrors} = state.document
    const hasValidationErrors = validationErrors && Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length

    if (!hasBeenValidated || hasValidationErrors) return

    let document = state.document.local

    // If we're creating a new document, we need to inject any required Boolean
    // fields.
    if (creatingNew) {
      document = Object.assign({}, state.document.remote, state.document.local)
    }

    actions.saveDocument({
      api,
      collection,
      document,
      documentId: creatingNew ? null : documentId
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

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    document: state.document,
    documents: state.documents,
    router: state.router,
    user: state.user
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...documentActions,
    ...documentsActions,
    ...userActions
  }, dispatch)
)(MediaEditToolbar)
