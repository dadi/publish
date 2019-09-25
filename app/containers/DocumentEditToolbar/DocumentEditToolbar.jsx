import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import * as userActions from 'actions/userActions'
import {Button, ButtonWithOptions, Select} from '@dadi/edit-ui'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import DateTime from 'components/DateTime/DateTime'
import {ExpandMore} from '@material-ui/icons'
import HotKeys from 'lib/hot-keys'
import Modal from 'components/Modal/Modal'
import Prompt from 'components/Prompt/Prompt'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './DocumentEditToolbar.css'

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

    this.handleDelete = this.handleDelete.bind(this)
    this.handleLanguageChange = this.handleLanguageChange.bind(this)
    this.hotkeys = new HotKeys({
      'mod+s': this.handleSave.bind(this, null)
    })
    this.onSave = null

    this.showDeletePrompt = () => this.setState({isShowingDeletePrompt: true})
    this.hideDeletePrompt = () => this.setState({isShowingDeletePrompt: false})
    this.toggleExpand = () =>
      this.setState(({isExpanded}) => ({isExpanded: !isExpanded}))

    this.state = {
      isExpanded: false,
      isShowingDeletePrompt: false
    }
  }

  componentDidMount() {
    this.hotkeys.addListener()
  }

  componentWillUnmount() {
    this.hotkeys.removeListener()
  }

  getSaveOptions(documentId) {
    const primary = {
      action: this.handleSave.bind(
        this,
        Constants.SAVE_ACTION_SAVE_AND_CONTINUE
      ),
      label: 'Save'
    }
    const secondary = [
      {
        text: 'Save & create new',
        onClick: this.handleSave.bind(
          this,
          Constants.SAVE_ACTION_SAVE_AND_CREATE_NEW
        )
      },
      {
        text: 'Save & go back',
        onClick: this.handleSave.bind(
          this,
          Constants.SAVE_ACTION_SAVE_AND_GO_BACK
        )
      }
    ]

    if (documentId) {
      secondary.push({
        text: 'Save as duplicate',
        onClick: this.handleSave.bind(
          this,
          Constants.SAVE_ACTION_SAVE_AS_DUPLICATE
        )
      })
    }

    return {
      primary,
      secondary
    }
  }

  handleDelete() {
    const {actions, collection, contentKey, state} = this.props
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

  handleLanguageChange(event) {
    const {onBuildBaseUrl, route} = this.props
    const redirectUrl = onBuildBaseUrl({
      search: {lang: event.target.value}
    })

    route.history.push(redirectUrl)
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
      isSingleDocument,
      multiLanguage,
      route,
      state
    } = this.props
    const {api} = state.app.config
    const {document: documentStore} = state
    const document = documentStore[contentKey] || {}
    const {isSaving, remote = null, validationErrors} = document
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
    const hasValidationErrors =
      validationErrors &&
      Object.keys(validationErrors).filter(field => validationErrors[field])
        .length
    const saveOptions = this.getSaveOptions(documentId)

    const showLanguageSelector = multiLanguage && api.languages.length > 1
    const languages = api.languages.map(({code, name}) => ({
      value: code,
      label: name
    }))

    let {lang: currentLanguage} = route.search

    // No language is selected, so we'll set the value of the dropdown to the
    // value of the default language.
    if (showLanguageSelector && !currentLanguage) {
      const defaultLanguage = api.languages.find(language => language.default)

      currentLanguage = defaultLanguage && defaultLanguage.code
    }

    const {isExpanded} = this.state
    const containerStyle = new Style(styles, 'container').addIf(
      'expanded',
      isExpanded
    )

    return (
      <footer className={containerStyle.getClasses()}>
        <div className={styles.expand}>
          <button onClick={this.toggleExpand}>
            <ExpandMore fontSize="large" />
          </button>
        </div>
        <div className={styles.content}>
          {showLanguageSelector && (
            <Select
              className={styles['language-selector']}
              onChange={this.handleLanguageChange}
              options={languages}
              value={currentLanguage}
            />
          )}

          <div className={styles.metadata}>
            {remote && remote._createdAt && (
              <div>
                <span>Created </span>

                {remote._createdBy && (
                  <span>
                    by <strong>{remote._createdBy}</strong>{' '}
                  </span>
                )}

                <DateTime date={remote._createdAt} relative={true} />
              </div>
            )}

            {remote && remote._lastModifiedAt && (
              <div>
                <span>Last updated </span>

                {remote._lastModifiedBy && (
                  <span>
                    by <strong>{remote._lastModifiedBy}</strong>{' '}
                  </span>
                )}

                <DateTime date={remote._lastModifiedAt} relative={true} />
              </div>
            )}
          </div>

          <div className={styles.buttons}>
            {remote && !isSingleDocument && (
              <Button
                accent="negative"
                className={styles['delete-button']}
                disabled={Boolean(hasConnectionIssues)}
                filled
                onClick={this.showDeletePrompt}
              >
                Delete
              </Button>
            )}

            {this.state.isShowingDeletePrompt && (
              <Modal onRequestClose={this.hideDeletePrompt}>
                <Prompt
                  accent="negative"
                  action={'Yes, delete it'}
                  onCancel={this.hideDeletePrompt}
                  onConfirm={this.handleDelete}
                >
                  Are you sure you want to delete this document?
                </Prompt>
              </Modal>
            )}

            {isSingleDocument ? (
              <Button
                accent="positive"
                className={styles['save-button']}
                disabled={Boolean(
                  hasConnectionIssues || hasValidationErrors || isSaving
                )}
                isLoading={isSaving}
                onClick={saveOptions.primary.action}
              >
                Save document
              </Button>
            ) : (
              <ButtonWithOptions
                accent="positive"
                className={styles['save-button-options']}
                disabled={Boolean(
                  hasConnectionIssues || hasValidationErrors || isSaving
                )}
                isLoading={isSaving}
                onClick={saveOptions.primary.action}
                options={saveOptions.secondary}
              >
                {saveOptions.primary.label}
              </ButtonWithOptions>
            )}
          </div>
        </div>
      </footer>
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

export default connectRouter(
  connectRedux(appActions, documentActions, userActions)(DocumentEditToolbar)
)
