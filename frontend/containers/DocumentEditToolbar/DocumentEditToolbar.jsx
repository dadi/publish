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
import * as userActions from 'actions/userActions'

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

const ACTION_SAVE = 'save'
const ACTION_SAVE_AND_CREATE_NEW = 'saveAndCreateNew'
const ACTION_SAVE_AND_GO_BACK = 'saveAndGoBack'
const ACTION_SAVE_AS_DUPLICATE = 'saveAsDuplicate'

const availableSaveOptions = [
  {
    default: true,
    label: 'Save and continue',
    action: ACTION_SAVE,
    enableForExistingDocuments: true,
    enableForNewDocuments: true
  },
  {
    label: 'Save and create new',
    action: ACTION_SAVE_AND_CREATE_NEW,
    enableForExistingDocuments: true,
    enableForNewDocuments: true
  },
  {
    label: 'Save and go back',
    action: ACTION_SAVE_AND_GO_BACK,
    enableForExistingDocuments: true,
    enableForNewDocuments: true
  },
  {
    label: 'Save as duplicate',
    action: ACTION_SAVE_AS_DUPLICATE,
    enableForExistingDocuments: true
  }
]
  
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
     * Whether to render a control for selecting different languages.
     */
    multiLanguage: proptypes.bool,

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

    let saveOptions = this.getSaveOptions(documentId)
    let languages = Boolean(api) &&
      Boolean(api.languages) &&
      (api.languages.length > 1) &&
      api.languages.reduce((languagesObject, language) => {
        languagesObject[language.code] = language.name

        return languagesObject
      }, {})
    let currentLanguage = state.router.search.lang

    // No language is selected, so we'll set the value of the dropdown to the
    // value of the default language.
    if (languages && !currentLanguage) {
      let defaultLanguage = api.languages.find(language => {
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

        {multiLanguage && languages && (
          <DropdownNative
            onChange={this.handleLanguageChange.bind(this)}
            options={languages}
            value={currentLanguage}
          />
        )}

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
            <ButtonWithOptions
              accent="save"
              disabled={hasConnectionIssues || hasValidationErrors || isSaving}
              isLoading={isSaving}
              onClick={this.handleSave.bind(this, saveOptions.primary.action)}
              options={saveOptions.secondary}
            >
              {saveOptions.primary.label}
            </ButtonWithOptions>
          </div>
        </div>
      </Toolbar>
    )
  }

  componentWillUnmount() {
    this.keyboard.off()
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

  getSaveOptions(documentId) {
    const {state} = this.props

    // We start by filtering the available save options based on whether we're
    // editing an existing document or creating a new one, as some options may
    // not be available in both contexts.
    let saveOptions = availableSaveOptions.filter(option => {
      if (documentId && !option.enableForExistingDocuments) return false
      if (!documentId && !option.enableForNewDocuments) return false

      return true
    })

    let userSavedOption = state.user.remote.data[
      Constants.FIELD_SAVE_OPTIONS
    ]

    // Our first choice for primary save option is any option saved against
    // the user record.
    let primaryOption = userSavedOption && saveOptions.find(option => {
      return option.action === userSavedOption
    })

    // If the above yields nothing, or if the saved option doesn't correspond
    // to a valid save option, we'll grab the first available option with the
    // `default` property. If that doesn't work either, we'll simply take the
    // first option from the list.
    if (!primaryOption) {
      primaryOption = saveOptions.find(option => option.default) ||
        saveOptions[0]
    }

    // The secondary options will be all the available options that aren't the
    // primary one. For convenience, we return them as an Object with a format
    // that ButtonWithOptions will accept.
    let secondaryOptions = saveOptions.reduce((options, option) => {
      if (option.action !== primaryOption.action) {
        options[option.label] = this.handleSave.bind(this, option.action)  
      }

      return options
    }, {})

    return {
      primary: primaryOption,
      secondary: secondaryOptions
    }
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
      onBuildBaseUrl,
      section,
      state
    } = this.props
    const newDocument = !Boolean(this.props.documentId)

    switch (saveMode) {
      // Save
      case ACTION_SAVE:
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

        break

      // Save and create new
      case ACTION_SAVE_AND_CREATE_NEW:
        this.onSave = {
          callback: documentId => {
            let newUrl = onBuildBaseUrl({
              createNew: true,
              section: null
            })

            route(newUrl)

            actions.setNotification({
              message: `The document has been ${newDocument ? 'created' : 'updated'}`
            })

            actions.clearRemoteDocument()
          }
        }

        break

      // Save and go back
      case ACTION_SAVE_AND_GO_BACK:
        this.onSave = {
          callback: documentId => {
            let newUrl = onBuildBaseUrl({
              documentId: null,
              section: null
            })

            route(newUrl)

            actions.setNotification({
              message: `The document has been ${newDocument ? 'created' : 'updated'}`
            })
          }
        }

        break

      // Save as duplicate
      case ACTION_SAVE_AS_DUPLICATE:
        this.onSave = {
          callback: documentId => {
            let newUrl = onBuildBaseUrl({
              documentId
            })

            route(newUrl)

            actions.setNotification({
              message: `The document has been created`
            })
          },
          createNew: true
        }

        break
    }    

    actions.registerSaveAttempt(saveMode)
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
)(DocumentEditToolbar)
