import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import * as userActions from '../../actions/userActions'

import Main from '../../components/Main/Main'
import Modal from '../../components/Modal/Modal'
import SubmitButton from '../../components/SubmitButton/SubmitButton'
// import Session from '../../lib/session'

class Login extends Component {

  constructor(props) {
    super(props)
    this.signIn = this.signIn.bind(this)
  }
  
  render() {
    const { state, actions } = this.props

    return (
      <div>
        <p>Signed in: {state.signedIn}</p>
        <p>Username: {state.username}</p>
        <p>Name: {state.name}</p>
        <a href="/users">Users</a>
        <SubmitButton
            value="Sign in"
            onClick={this.signIn}
            />
        <SubmitButton
            value="Sign out"
            onClick={actions.signOut}
            />
      </div>
    )
  }
  signIn () {
    const { actions, state } = this.props
    // new Session().createSession({username: 'foo', password: 'bar'}).then((session) => {
    //   if (session.signedIn) {
    //     actions.signIn(session.username, session.signedIn)
    //   } else {
    //     console.log("LOGIN FAILED")
    //   }
    // })
  }
}

export default connectHelper(
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(Login)
