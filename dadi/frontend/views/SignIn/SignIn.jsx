import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import * as userActions from '../../actions/userActions'

import Main from '../../components/Main/Main'
import SignInForm from '../../components/SignInForm/SignInForm'
import Debug from '../../components/Debug/Debug'
import Session from '../../lib/session'

class SignIn extends Component {

  constructor(props) {
    super(props)
    this.signIn = this.signIn.bind(this)
  }
  
  render() {
    const { state, actions } = this.props

    return (
      <div >
        <Debug val={state.signedIn}/>
        <Debug val={state.username}/>
        <SignInForm onSubmit={this.signIn} />
      </div>
    )
  }
  signIn (event) {
    event.preventDefault()
    const { actions, state, loginUsername, loginPassword } = this.props
    new Session().createSession({username: loginUsername, password: loginPassword}).then((session) => {
      if (session.signedIn) {
        console.log("SUCCESS")
    //     actions.signIn(session.username, session.signedIn)
      } else {
        console.log("SIGNIN FAILED")
      }
    })
  }
}

export default connectHelper(
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(SignIn)
