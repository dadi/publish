import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import * as userActions from '../../actions/userActions'

import Nav from '../../components/Nav/Nav'

const localApiBridge = require('./../../lib/local-api-bridge-client')

class UserList extends Component {

  componentDidMount() {
    const { state, actions } = this.props
    return this.getUsers(state).then(users => {
      actions.setUserList(users)
    })
  }

  render() {
    const { state } = this.props
    return (
      <main>
        <Nav />
        <ul>
          {state.users.map(user => (
            <li>
              <h3>{user.name}</h3>
              <p>username: {user.username}</p>
            </li>
          ))}
        </ul>
      </main>
    )
  }

  getUsers (state) {
    return localApiBridge()
    .in('users')
    .whereFieldExists('name')
    .find({extractResults: true})
  }
}

export default connectHelper(
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(UserList)
