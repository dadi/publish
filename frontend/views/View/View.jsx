import {Component, h} from 'preact'
import {connectHelper} from 'lib/util'
import {route} from 'preact-router'

import * as Constants from 'lib/constants'

class View extends Component {
  render(props) {
    const {authenticate, state} = this.props
    const {user} = state
    const notAuthenticated = user.status === Constants.STATUS_FAILED
    const Handler = props.component

    if (authenticate && notAuthenticated) {
      route('/sign-in')

      return null
    }

    if (user.status === Constants.STATUS_LOADING) {
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
