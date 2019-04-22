'use strict'

import * as appActions from 'actions/appActions'
import * as userActions from 'actions/userActions'
import {h, Component} from 'preact'
import {connectHelper} from 'lib/util'
import {Keyboard} from 'lib/keyboard'
import Button from 'components/Button/Button'
import proptypes from 'proptypes'
import styles from './ProfileEditToolbar.css'
import Toolbar from 'components/Toolbar/Toolbar'

const actions = {
  ...appActions,
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
    const previousState = prevProps.state
    const {isSaving, remoteError, validationErrors} = state
    const hasValidationErrors = validationErrors && Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length

    // Have we just saved?
    if (previousState.isSaving && !isSaving && !remoteError && !hasValidationErrors) {
      dispatch(
        actions.setNotification({
          message: 'Your profile has been updated'
        })
      )
    }

    // Are we trying to save?
    if (!previousState.hasBeenValidated && !previousState.hasBeenSubmitted && state.hasBeenSubmitted) {
      this.saveUser()
    }    
  }

  render() {
    const {
      state
    } = this.props
    const validationErrors = state.validationErrors
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
    const {
      dispatch,
      state
    } = this.props

    if (!state.hasBeenValidated) {
      return dispatch(
        actions.registerSaveUserAttempt()
      )
    }
    
    this.saveUser()
  }

  saveUser() {
    const {
      dispatch,
      state
    } = this.props
    const validationErrors = state.validationErrors
    const hasValidationErrors = Boolean(
      Object.keys(validationErrors || {})
        .filter(field => validationErrors[field])
        .length
    )

    if (!hasValidationErrors) {
      dispatch(actions.saveUser())
    }
  }
}

export default connectHelper(
  state => state.user
)(ProfileEditToolbar)
