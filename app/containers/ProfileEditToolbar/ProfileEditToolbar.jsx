import * as appActions from 'actions/appActions'
import * as userActions from 'actions/userActions'
import {connectRedux} from 'lib/redux'
import Button from 'components/Button/Button'
import proptypes from 'prop-types'
import React from 'react'
import styles from './ProfileEditToolbar.css'
import Toolbar from 'components/Toolbar/Toolbar'

const actions = {
  ...appActions,
  ...userActions
}

/**
 * A toolbar used in a document edit view.
 */
class ProfileEditToolbar extends React.Component {
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

  handleSave() {
    const {actions} = this.props

    actions.registerSaveUserAttempt()
  }

  render() {
    const {state} = this.props
    const validationErrors = state.validationErrors
    const hasValidationErrors = validationErrors &&
      Object.keys(validationErrors)
        .filter(field => validationErrors[field])
        .length

    return (
      <Toolbar>
        <div className={styles.container}>
          <Button
            accent="save"
            disabled={hasValidationErrors}
            onClick={this.handleSave.bind(this)}
          >Save settings</Button>
        </div>
      </Toolbar>
    )
  }
}

export default connectRedux(
  userActions
)(ProfileEditToolbar)
