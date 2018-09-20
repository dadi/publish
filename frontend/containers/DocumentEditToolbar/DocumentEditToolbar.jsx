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

const FIELD_PUBLISH_SAVE_OPTIONS_LAST_USED = 'publishSaveOptionsLastUsed',
  SAVE_AND_CONTINUE = 'Save and continue',
  SAVE_AND_CREATE_NEW = 'Save and create new',
  SAVE_AND_GO_BACK = 'Save and go back',
  SAVE_AS_DUPLICATE = 'Save as duplicate',
  
  ACTION_SAVE = 'save',
  ACTION_SAVE_AND_CREATE_NEW = 'saveAndCreateNew',
  ACTION_SAVE_AND_GO_BACK = 'saveAndGoBack',
  ACTION_SAVE_AS_DUPLICATE = 'saveAsDuplicate',
  
  METHOD_EDIT = 'edit',
  METHOD_NEW = 'new',
  
  availableSaveOptions = {
    default: SAVE_AND_CONTINUE,
    options: new Map(
      [
        [
          SAVE_AND_CONTINUE,
          {
            action: ACTION_SAVE,
            methods: [
              METHOD_EDIT,
              METHOD_NEW
            ]
          }
        ],
        [
          SAVE_AND_CREATE_NEW,
          {
            action: ACTION_SAVE_AND_CREATE_NEW,
            methods: [
              METHOD_EDIT,
              METHOD_NEW
            ]
          }
        ],
        [
          SAVE_AND_GO_BACK,
          {
            action: ACTION_SAVE_AND_GO_BACK,
            methods: [
              METHOD_EDIT,
              METHOD_NEW
            ]
          }
        ],
        [
          SAVE_AS_DUPLICATE,
          {
            action: ACTION_SAVE_AS_DUPLICATE,
            methods: [
              // If we're editing an existing document, we also allow users to duplicate
              // the document.
              METHOD_EDIT
            ]
          }
        ]
      ]
    )
  }

const filterMap = fn => map => new Map(Array.from(map).filter(fn))

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
      collection,
      group,
      state
    } = this.props
    const document = state.document
    const previousDocument = prevProps.state.document
    const wasFirstValidated = !previousDocument.hasBeenValidated &&
      document.hasBeenValidated

    // Have we just saved a document?
    if (previousDocument.isSaving && !document.isSaving) {
      if (typeof this.onSave.callback === 'function') {
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
    const method = documentId ? 'edit' : 'new'

    const savedSaveOptionOnUser = state.user.remote.data[FIELD_PUBLISH_SAVE_OPTIONS_LAST_USED]

    const savedSaveOption = savedSaveOptionOnUser || availableSaveOptions.default

    const localSaveOptions = filterMap(
      ([,option]) => option.methods.includes(method)
    )(
      availableSaveOptions.options
    )

    // Change based on user data

    const defaultSaveOptionName = localSaveOptions.has(savedSaveOption) ?
      savedSaveOption :
      availableSaveOptions.default

    const invisibleSaveOptions = filterMap(([name]) => name !== defaultSaveOptionName)(localSaveOptions)

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
          {document && document._createdAt &&
            <p>
              <span>Created </span>
              <DateTime
                date={document._createdAt}
                relative={true}
              />
            </p>
          }

          {document && document._lastModifiedAt &&
            <p class={styles['metadata-emphasis']}>
              <span>Last updated </span>
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
              onClick={this.saveDefaultActionAndExecute.bind(this, defaultSaveOptionName)}
              options={invisibleSaveOptions}
              callback={this.saveDefaultActionAndExecute.bind(this)}
            >
              {defaultSaveOptionName}
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
    const {currentApi, currentCollection} = state.api
    const document = state.document.remote

    if (document._id) {
      actions.deleteDocuments({
        api: currentApi,
        collection: currentCollection,
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
      collection,
      group,
      onBuildBaseUrl,
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
      case 'saveAndCreateNew':
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
      case 'saveAndGoBack':
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
      case 'saveAsDuplicate':
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

    actions.registerSaveAttempt()
  }

  /**
   * Saves the default action.
   * 
   * @param {string} defaultActionName
   * @return void
   */
  saveDefaultAction(defaultActionName) {
    const {
      actions,
      state
    } = this.props

    actions.updateLocalUser(`data.${FIELD_PUBLISH_SAVE_OPTIONS_LAST_USED}`, defaultActionName);
    actions.saveUser()
  }

  /**
   * Saves the default action and executes the action.
   * 
   * @param {string} defaultActionName
   * @return void
   */
  saveDefaultActionAndExecute(defaultActionName) {
    this.saveDefaultAction(defaultActionName)

    // Execute the action
    this.handleSave.call(
      this,
      availableSaveOptions.options.get(defaultActionName).action
    );
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

    let document = state.document.local

    // If we're creating a new document, we need to inject any required Boolean
    // fields.
    if (creatingNew) {
      document = Object.assign({}, state.document.remote, state.document.local)
    }

    actions.saveDocument({
      api: state.api.currentApi,
      collection: state.api.currentCollection,
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
    document: state.document,
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
