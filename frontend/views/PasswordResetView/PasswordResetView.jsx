import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {route} from 'preact-router-regex'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'
import Validation from 'lib/util/validation'

import * as userActions from 'actions/userActions'
import * as Constants from 'lib/constants'

import Banner from 'components/Banner/Banner'
import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

import styles from './PasswordResetView.css'

class PasswordResetView extends Component {
  constructor(props) {
    super(props)
    
    this.validation = new Validation()
    this.state.email = ''
    this.state.formDataIsValid = false
  }

  render() {
    const {state, actions} = this.props
    const {user} = state
    const {formDataIsValid} = this.state

    if (user.resetEmail && user.resetExpiresAt) {
      this.error = 'Please check your inbox for a password reset email.'
    }

    // If the user is signed in, redirect to the reset password panel of the
    // profile page.
    if (user.remote) {
      route('/profile/password-reset')

      return null
    }

    setPageTitle('Reset password')

    return (
      <div class={styles.wrapper}>
        <div class={styles.overlay}>
          <div class={styles.container}>
            <form
              action="/profile"
              method="POST"
              onSubmit={this.handleResetPassword.bind(this)}
            >
              <img class={styles.logo} src="/public/images/publish.png" />

              {this.error &&
                <Banner>{this.error}</Banner>
              }

              <div class={styles.inputs}>
                <div class={styles.input}>
                  <Label label="Email">
                    <TextInput
                      placeholder="Your email address"
                      onChange={this.handleInputChange.bind(this, 'email')}
                      onKeyUp={this.handleInputChange.bind(this, 'email')}
                      validation={this.validation.email}
                      value={this.state.email}
                    />
                  </Label>
                </div>
              </div>

              <Button
                accent="system"
                type="submit"
                disabled={!formDataIsValid}
              >Reset password</Button>

              <a class={styles.link} href="/sign-in">Sign-in</a>
            </form>
          </div>
        </div>
      </div>
    )
  }

  handleInputChange(name, event) {
    this.setState({
      [name]: event.target.value,
      formDataIsValid: event.isValid
    })
  }

  handleResetPassword(event) {
    const {actions} = this.props
    const {email} = this.state

    actions.requestPasswordReset(email)

    event.preventDefault()
  }
}

export default connectHelper(
  state => ({
    user: state.user
  }),
  dispatch => bindActionCreators(userActions, dispatch)
)(PasswordResetView)
