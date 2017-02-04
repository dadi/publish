import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import Nav from '../../components/Nav/Nav'

class RoleList extends Component {
  render() {
    return (
      <main>
        <Nav />
        <h1>Role List</h1>
      </main>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(RoleList)
