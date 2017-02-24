import { h, Component } from 'preact'
import { connect } from 'preact-redux'
import { route } from 'preact-router'
import { bindActionCreators } from 'redux'
import { connectHelper, isEmpty } from 'lib/util'

import * as userActions from 'actions/userActions'

import Button from 'components/Button/Button'
import FieldLabel from 'components/FieldLabel/FieldLabel'
import TextInput from 'components/TextInput/TextInput'

import Session from 'lib/session'

import styles from './SignIn.css'

class SignIn extends Component {

  constructor(props) {
    super(props)

    this.state.email = ''
    this.state.password = ''
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Do nothing if session check inconclusive
    return !isEmpty(nextProps.state.signedIn)
  }

  componentWillUpdate() {
    const { state, actions } = this.props

    if (state.signedIn) {
      // Redirect signed-in user
      route('/profile')
    }
  }

  render() {
    const { state, actions } = this.props

    return (
      <div class={styles.wrapper}>
        <div class={styles.overlay}>
          <div class={styles.container}>
            <img class={styles.logo} src="/images/publish.png" />
            
            <div class={styles.inputs}>
              <div class={styles.input}>
                <FieldLabel label="Email">
                  <TextInput
                    placeholder="Your email address"
                    onChange={this.handleInputChange.bind(this, 'email')}
                    value={this.state.email}
                  />
                </FieldLabel>
              </div>

              <div class={styles.input}>
                <FieldLabel label="Password">
                  <TextInput
                    type="password"
                    placeholder="Your password"
                    onChange={this.handleInputChange.bind(this, 'password')}
                    value={this.state.password}
                  />
                </FieldLabel>
              </div>
            </div>

            <Button accent="system"
              onClick={this.signIn.bind(this)}
            >Sign In</Button>
          </div>
        </div>
      </div>
    )
  }

  signIn (event) {
    const { actions, state } = this.props

    new Session().createSession({
      username: this.state.email,
      password: this.state.password
    }).then(session => {
      if (session.signedIn) {
        actions.signIn(session.username, session.signedIn)
        route('/profile')
      } else {
        actions.signOut()

        console.log('*** WRONG INFO')
      }
    })

    event.preventDefault()
  }

  handleInputChange(name, event) {
    this.setState({
      [name]: event.target.value
    })
  }
}

export default connectHelper(
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(SignIn)
