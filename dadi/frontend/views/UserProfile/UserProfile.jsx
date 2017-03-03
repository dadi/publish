import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

import * as apiActions from 'actions/apiActions'

class UserProfile extends Component {
  render() {
    const { state } = this.props

    return (
      <h3>User Profile</h3>
    )
  }
}

export default connectHelper(
  state => state.api,
  dispatch => bindActionCreators(apiActions, dispatch)
)(UserProfile)
