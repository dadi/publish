'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentEditToolbar.css'

import * as Constants from 'lib/constants'
import {Keyboard} from 'lib/keyboard'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'

import {bindActionCreators} from 'redux'
import {buildUrl} from 'lib/router'
import {connectHelper} from 'lib/util'
import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'
import {route} from 'preact-router-regex'

import ButtonWithOptions from 'components/ButtonWithOptions/ButtonWithOptions'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DateTime from 'components/DateTime/DateTime'
import Peer from 'components/Peer/Peer'
import Toolbar from 'components/Toolbar/Toolbar'

/**
 * A toolbar used in a document edit view.
 */
class DocumentEditToolbar extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The name of the collection currently being listed.
     */
    collection: proptypes.string,

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
    this.onSave = null
  }

  componentDidMount() {
    this.keyboard.on('cmd+s').do(this.handleSave.bind(this, 'save'))
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      actions,
      collection,
      group,
      state
    } = this.props
    const document = state.document
    const previousDocument = prevProps.state.document
    const status = document.remoteStatus
    const wasFirstValidated = !previousDocument.validationErrors && document.validationErrors
    const wasSaving = previousDocument.remoteStatus === Constants.STATUS_SAVING

    // Have we just saved a document?
    if (wasSaving && (status !== Constants.STATUS_SAVING)) {
      if (typeof this.onSave.callback === 'function') {
        this.onSave.callback(state.document.remote ? state.document.remote._id : null)
      }
    }

    // Are we trying to save the document?
    if ((previousDocument.saveAttempts < document.saveAttempts) ||
        (wasFirstValidated && document.saveAttempts > 0)) {
      this.saveDocument()
    }

    // Have we deleted a document?
    if (previousDocument.remote && !document.remote) {
      // Redirect to document list view
      route(buildUrl(group, collection))

      actions.setNotification({
        message: 'The documents have been deleted'
      })
    }
  }

  render() {
    const {
      documentId,
      state
    } = this.props
    const document = state.document.remote
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
      && Object.keys(document.validationErrors)
        .filter(field => document.validationErrors[field])
        .length
    const isSaving = state.document.remoteStatus === Constants.STATUS_SAVING
    const validationErrors = state.document.validationErrors
    const hasValidationErrors = validationErrors && Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length
    const method = documentId ? 'edit' : 'new'
    const peers = state.document.peers

    // By default, we support these two save modes.
    let saveOptions = {
      'Save and create new': this.handleSave.bind(this, 'saveAndCreateNew'),
      'Save and go back': this.handleSave.bind(this, 'saveAndGoBack')
    }

    // If we're editing an existing document, we also allow users to duplicate
    // the document.
    if (method === 'edit') {
      saveOptions['Save as duplicate'] = this.handleSave.bind(this, 'saveAsDuplicate')
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

        <div class={styles.metadata}>
          {document && document.createdAt &&
            <p>
              <span>Created </span>
              <DateTime
                date={document.createdAt}
                relative={true}
              />
            </p>
          }

          {document && document.lastModifiedAt &&
            <p class={styles['metadata-emphasis']}>
              <span>Last updated </span>
              <DateTime
                date={document.lastModifiedAt}
                relative={true}
              />
            </p>
          }
        </div>

        <div class={styles.buttons}>
          <div class={styles.button}>
            <ButtonWithPrompt
              accent="destruct"
              className={styles.button}
              disabled={hasConnectionIssues}
              onClick={this.handleDelete.bind(this)}
              promptCallToAction="Yes, delete it."
              promptMessage="Are you sure you want to delete this document?"
            >Delete</ButtonWithPrompt> 
          </div>

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
      collection,
      group,
      referencedField,
      state
    } = this.props
    const document = state.document.remote
    const currentApi = getApiForUrlParams(state.api.apis, {
      collection,
      group
    })
    const currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      referencedField,
      useApi: currentApi
    })
    const query = {
      api: currentApi,
      collection: currentCollection,
      ids: [document._id]
    }

    if (document._id) {
      actions.deleteDocuments(query)
    }
  }

  handleSave(saveMode) {
    const {
      actions,
      collection,
      group,
      section,
      state
    } = this.props
    const newDocument = !Boolean(this.props.documentId)

    switch (saveMode) {
      // Save
      case 'save':
        this.onSave = {
          callback: documentId => {
            if (!documentId) {
              actions.setNotification({
                message:`Document failed to save`
              }) 
              return
            }
            route(buildUrl(group, collection, documentId, section))

            actions.setNotification({
              message:`The document has been ${newDocument ? 'created' : 'updated'}`
            })
          }
        }

        break

      // Save and create new
      case 'saveAndCreateNew':
        this.onSave = {
          callback: documentId => {
            route(buildUrl(group, collection, 'new'))

            actions.setNotification({
              message: `The document has been ${newDocument ? 'created' : 'updated'}`
            })

            actions.clearRemoteDocument()
          }
        }

        break

      // Save and go back
      case 'saveAndGoBack':
        this.onSave = {
          callback: documentId => {
            route(buildUrl(group, collection))

            actions.setNotification({
              message: `The document has been ${newDocument ? 'created' : 'updated'}`
            })
          }
        }

        break

      // Save as duplicate
      case 'saveAsDuplicate':
        this.onSave = {
          callback: documentId => {
            route(buildUrl(group, collection, documentId, section))

            actions.setNotification({
              message: `The document has been created`
            })
          },
          createNew: true
        }

        break
    }    

    actions.registerSaveAttempt()
  }

  saveDocument() {
    const {
      actions,
      collection,
      documentId,
      group,
      referencedField,
      state
    } = this.props
    const creatingNew = this.onSave && this.onSave.createNew
    const validationErrors = state.document.validationErrors
    const hasValidationErrors = !validationErrors || Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length

    if (hasValidationErrors) return

    const currentApi = getApiForUrlParams(state.api.apis, {
      collection,
      group
    })
    const currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      referencedField,
      useApi: currentApi
    })

    let document = state.document.local

    // If we're creating a new document, we need to inject any required Boolean
    // fields.
    if (creatingNew) {
      document = Object.assign({}, state.document.remote, state.document.local)
    }

    actions.saveDocument({
      api: currentApi,
      collection: currentCollection,
      document,
      documentId: creatingNew ? null : documentId,
      group,
      urlCollection: collection
    })
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    document: state.document
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...documentActions,
    ...documentsActions
  }, dispatch)
)(DocumentEditToolbar)
