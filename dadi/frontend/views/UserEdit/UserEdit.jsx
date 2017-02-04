import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import * as userActions from '../../actions/userActions'

import Nav from '../../components/Nav/Nav'
import SubmitButton from '../../components/SubmitButton/SubmitButton'

import User from '../../lib/user'

class UserEdit extends Component {

  constructor(props) {
    super(props)
    this.createUser = this.createUser.bind(this)
  }

  render({ method, user }) {
    const { state, actions } = this.props
    return (
      <div>
        <Nav />
        <h1>User Edit: { method }</h1>
        {user ? (
          <h1>Current User is { user }</h1>
        ) : (
          <h1>No User selected</h1>
        )}
        <SubmitButton
          value="Create User"
          onClick={this.createUser}
        />
      </div>
    )
  }

  createUser () {
    const { actions, state } = this.props
    new User().createUser({
      email: 'email@domain.com',
      username: 'arthurTest',
      password: 'passwordtest',
      fullname: 'Full Name Test Again'
    }).then((resp) => {
      console.log("INSERT RESPONSE", resp)
    })
  }
}

export default connectHelper(
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(UserEdit)
