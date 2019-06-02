import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import * as userActions from 'actions/userActions'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import Button from 'components/Button/Button'
import ButtonWithOptions from 'components/ButtonWithOptions/ButtonWithOptions'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DateTime from 'components/DateTime/DateTime'
import DropdownNative from 'components/DropdownNative/DropdownNative'
import proptypes from 'prop-types'
import React from 'react'
import styles from './DocumentEditToolbar.css'
import Toolbar from 'components/Toolbar/Toolbar'
  
/**
 * A toolbar used in a document edit view.
 */
class DocumentEditToolbar extends React.Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The unique key that identifies the content being edited.
     */
    contentKey: proptypes.string,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * Whether the collection is a single-document collection.
     */
    isSingleDoc: proptypes.bool,

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
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)
    
    this.onSave = null
  }

  getSaveOptions(documentId) {
    const primary = {
      action: this.handleSave.bind(
        this,
        Constants.SAVE_ACTION_SAVE_AND_CONTINUE
      ),
      label: 'Save and continue'
    }
    let secondary = {
      'Save and create new': this.handleSave.bind(
        this,
        Constants.SAVE_ACTION_SAVE_AND_CREATE_NEW,
      ),
      'Save and go back': this.handleSave.bind(
        this,
        Constants.SAVE_ACTION_SAVE_AND_GO_BACK
      )
    }

    if (documentId) {
      secondary['Save as duplicate'] = this.handleSave.bind(
        this,
        Constants.SAVE_ACTION_SAVE_AS_DUPLICATE
      )
    }

    return {
      primary,
      secondary
    }
  }

  handleDelete() {
    const {
      actions,
      collection,
      contentKey,
      state
    } = this.props
    const documentStore = state.document[contentKey]
    const {remote: document} = documentStore

    if (document._id) {
      actions.deleteDocuments({
        collection,
        contentKey,
        ids: [document._id]
      })
    }
  }

  handleLanguageChange(newLanguage) {
    const {onBuildBaseUrl, router} = this.props
    const redirectUrl = onBuildBaseUrl({
      search: {
        lang: newLanguage
      }
    })

    router.history.push(redirectUrl)
  }

  handleSave(mode) {
    const {actions, contentKey} = this.props

    actions.registerSaveAttempt({
      contentKey,
      mode
    })
  }  

  render() {
    const {
      contentKey,
      documentId,
      isSingleDoc,
      multiLanguage,
      router,
      state
    } = this.props
    const {api} = state.app.config
    const {document: documentStore} = state
    const document = documentStore[contentKey] || {}
    const {
      isSaving,
      remote = null,
      validationErrors
    } = document
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
    const hasValidationErrors = validationErrors && Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length
    const saveOptions = this.getSaveOptions(documentId)
    const languages = api.languages.length <= 1
      ? null
      : api.languages.reduce((languagesObject, language) => {
          languagesObject[language.code] = language.name

          return languagesObject
        }, {})

    let {lang: currentLanguage} = router.search

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
        {multiLanguage && languages && (
          <DropdownNative
            className={styles['language-dropdown']}
            onChange={this.handleLanguageChange.bind(this)}
            options={languages}
            value={currentLanguage}
          />
        )}

        <div className={styles.metadata}>
          {remote && remote._createdAt &&
            <p>
              <span>Created </span>

              {remote._createdBy &&
                <span>by <strong>{remote._createdBy}</strong> </span>
              }

              <DateTime
                date={remote._createdAt}
                relative={true}
              />
            </p>
          }

          {remote && remote._lastModifiedAt &&
            <p className={styles['metadata-emphasis']}>
              <span>Last updated </span>

              {remote._lastModifiedBy &&
                <span>by <strong>{remote._lastModifiedBy}</strong> </span>
              }

              <DateTime
                date={remote._lastModifiedAt}
                relative={true}
              />
            </p>
          }
        </div>

        <div className={styles.buttons}>
          {remote && (
            <div className={styles.button}>
              <ButtonWithPrompt
                accent="destruct"
                className={styles.button}
                disabled={Boolean(hasConnectionIssues)}
                onClick={this.handleDelete.bind(this)}
                promptCallToAction="Yes, delete it."
                position="left"
                promptMessage="Are you sure you want to delete this document?"
              >Delete</ButtonWithPrompt> 
            </div>
          )}

          <div className={styles.button}>
            {isSingleDoc ? (
              <Button
                accent="save"
                disabled={Boolean(
                  hasConnectionIssues || hasValidationErrors || isSaving
                )}
                isLoading={isSaving}
                onClick={saveOptions.primary.action}
              >{saveOptions.primary.label}</Button>
            ) : (
              <ButtonWithOptions
                accent="save"
                disabled={Boolean(
                  hasConnectionIssues || hasValidationErrors || isSaving
                )}
                isLoading={isSaving}
                onClick={saveOptions.primary.action}
                options={saveOptions.secondary}
              >{saveOptions.primary.label}</ButtonWithOptions>
            )}
          </div>
        </div>
      </Toolbar>
    )
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

export default connectRouter(connectRedux(
  appActions,
  documentActions,
  userActions
)(DocumentEditToolbar))
