import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {route} from 'preact-router'
import {bindActionCreators} from 'redux'
import {connectHelper, isEmpty} from 'lib/util'

import * as userActions from 'actions/userActions'

import Session from 'lib/session'

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
