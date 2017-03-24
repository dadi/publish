import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {route} from 'preact-router'
import {bindActionCreators} from 'redux'
import {connectHelper, isEmpty} from 'lib/util'

import * as userActions from 'actions/userActions'

import Banner from 'components/Banner/Banner'
import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

import Session from 'lib/session'

import styles from './SignIn.css'

class SignIn extends Component {

  constructor(props) {
    super(props)

    this.state.email = ''
    this.state.password = ''
    this.state.error = false
  }

  componentWillUpdate() {
    const {state, actions} = this.props

    if (state.user) {
      // Redirect signed-in user
      route('/profile')
    }
  }

  render() {
    const {state, actions} = this.props

    return (
      <div class={styles.wrapper}>
        <div class={styles.overlay}>
          <div class={styles.container}>
            <form method="POST" action="/profile" onSubmit={this.signIn.bind(this)}>
              <img class={styles.logo} src="/images/publish.png" />

              {this.state.error &&
                <Banner>{this.state.message}</Banner>
              }

              <div class={styles.inputs}>
                <div class={styles.input}>
                  <Label label="Email">
                    <TextInput
                      placeholder="Your email address"
                      onChange={this.handleInputChange.bind(this, 'email')}
                      value={this.state.email}
                    />
                  </Label>
                </div>

                <div class={styles.input}>
                  <Label label="Password">
                    <TextInput
                      type="password"
                      placeholder="Your password"
                      onChange={this.handleInputChange.bind(this, 'password')}
                      value={this.state.password}
                    />
                  </Label>
                </div>
              </div>

              <Button
                accent="system"
                type="submit"
              >Sign In</Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  signIn(event) {
    event.preventDefault()

    const {actions, state} = this.props

    new Session().createSession({
      username: this.state.email,
      password: this.state.password
    }).then(user => {
      if (user && !user.err) {
        actions.setRemoteUser(user)

        route('/profile')
      } else {
        actions.signOut()
        this.setState({
          error: true,
          message: user.err ? Session.errors[user.err] : null // Move to lang when ready
        })
      }
    })
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
