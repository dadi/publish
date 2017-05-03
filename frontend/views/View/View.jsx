import {Component, h} from 'preact'
import {connectHelper} from 'lib/util'
import {route} from 'preact-router'

import * as Constants from 'lib/constants'

class View extends Component {
  render(props) {
    const {authenticate, state} = this.props
    const {user} = state
    const isAuthenticating = user.status === Constants.STATUS_IDLE ||
      user.status === Constants.STATUS_LOADING
    const isNotAuthenticated = user.status === Constants.STATUS_FAILED ||
      user.hasSignedOut
    const Handler = props.component

    if (authenticate && isNotAuthenticated) {
      route('/sign-in')

      return null
    }

    if (authenticate && isAuthenticating) {
      return null
    }

    return (
      <Handler {...props} />
    )
  }
}

export default connectHelper(
  state => ({
    user: state.user
  })
)(View)
