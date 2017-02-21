import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { route } from 'preact-router'
import { bindActionCreators } from 'redux'
import { connectHelper } from 'lib/util'

import * as userActions from 'actions/userActions'

import Button from 'components/Button/Button'
import FieldLabel from 'components/FieldLabel/FieldLabel'
import TextInput from 'components/TextInput/TextInput'

import Session from 'lib/session'

import styles from './SignIn.css'

class SignIn extends Component {

  constructor(props) {
    super(props)
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
      <div class={styles.wrapper}>
        <div class={styles.overlay}>
          <div class={styles.container}>
            <img class={styles.logo} src="/images/publish.png"/>
            
            <div class={styles.inputs}>
              <div class={styles.input}>
                <FieldLabel label="Email">
                  <TextInput placeholder="Your email address"/>
                </FieldLabel>
              </div>

              <div class={styles.input}>
                <FieldLabel label="Password">
                  <TextInput type="password" placeholder="Your password"/>
                </FieldLabel>
              </div>
            </div>

            <Button accent="system" onClick={this.signIn.bind(this)}>Sign In</Button>
          </div>
        </div>
      </div>
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
