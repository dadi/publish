import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import * as userActions from 'actions/userActions'

class SignOutView extends Component {
  componentWillMount() {
    const {state, actions} = this.props

    actions.signOut()
  }

  render() {
    return null
  }
}

export default connectHelper(
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(SignOutView)
