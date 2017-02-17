import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from 'lib/util'

class RoleList extends Component {
  render() {
    return (
      <h1>Role List</h1>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(RoleList)
