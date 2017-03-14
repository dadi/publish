import {h, Component} from 'preact'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

class PasswordReset extends Component {
  render() {
    return (
      <h1>Password Reset</h1>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(PasswordReset)
