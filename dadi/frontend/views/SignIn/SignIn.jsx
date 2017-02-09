import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { route } from 'preact-router'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import * as userActions from '../../actions/userActions'

import Main from '../../components/Main/Main'
import SignInForm from '../../components/SignInForm/SignInForm'
import Debug from '../../components/Debug/Debug'

/*
* Lib
 */
import Session from '../../lib/session'

class SignIn extends Component {

  constructor(props) {
    super(props)
    this.signIn = this.signIn.bind(this)
  }

  componentWillUpdate() {
    const { state, actions } = this.props
    if (state.signedIn) {
      route('/profile')
    }
  }
  
  render() {
    const { state, actions } = this.props

    return (
      <Main>
        <Debug val={state.signedIn}/>
        <Debug val={state.username}/>
        <SignInForm onSubmit={this.signIn} />
      </Main>
    )
  }
  signIn (event) {
    event.preventDefault()
    // loginUsername and loginPassword should come from form fields
    // const { actions, state, loginUsername, loginPassword } = this.props
    const { actions, state } = this.props
    // Temp
    let loginUsername = 'arthurmingard'
    let loginPassword = 'publishpass'
    new Session().createSession({username: loginUsername, password: loginPassword}).then((session) => {
      if (session.signedIn) {
        actions.signIn(session.username, session.signedIn)
        route('/profile')
      } else {
        actions.signOut()
      }
    })
  }
}

export default connectHelper(
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(SignIn)
