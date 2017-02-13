import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'
/*
* Components
 */
import Main from '../../components/Main/Main'

class RoleEdit extends Component {
  render() {
    const { method, role } = this.props
    return (
      <Main>
        <h1>Role Edit: { method }</h1>
        {role ? (
          <h1>Current Role is { role }</h1>
        ) : (
          <h1>No Role selected</h1>
        )}
      </Main>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({}, dispatch)
)(RoleEdit)
