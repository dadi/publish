import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from 'lib/util'

import * as userActions from 'actions/userActions'

import Nav from 'components/Nav/Nav'

class UserProfile extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        User Profile
      </div>
    )
  }
}

export default connectHelper(
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(UserProfile)
