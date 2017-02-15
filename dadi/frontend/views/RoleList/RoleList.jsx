import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from 'lib/util'

/*
* Components
 */
import Main from 'components/Main/Main'

class RoleList extends Component {
  render() {
    return (
      <Main>
        <Nav />
        <h1>Role List</h1>
      </Main>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(RoleList)
