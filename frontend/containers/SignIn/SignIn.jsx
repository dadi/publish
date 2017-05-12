'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'
import {connect} from 'preact-redux'
import {connectHelper} from 'lib/util'
import {route} from 'preact-router'
import Validation from 'lib/util/validation'

import * as userActions from 'actions/userActions'
import * as Constants from 'lib/constants'

import Banner from 'components/Banner/Banner'
import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

import styles from './SignIn.css'

class SignIn extends Component {
  static propTypes = {
    /**
     * The method used to update the current page title.
     */
     setPagetTitle: proptypes.func,

     /**
      * Whether this is a token signin.
      */
     isTokenSignin: proptypes.bool,

     /**
      * Sign in token.
      */
     token: proptypes.string
  }

  constructor(props) {
    super(props)

    this.validation = new Validation()
    this.state.email = ''
    this.state.password = ''
    this.state.formDataIsValid = false
    this.state.error = false
  }

  componentWillUpdate(nextProps, nextState) {
    const {actions, state, isTokenSignin} = this.props
    const {user} = state
    const nextUser = nextProps.state.user

    // If the user is signed in, redirect to the home view.
    if (user.remote) {
      route('/')
    }

    const hasFailed = nextUser.status === Constants.STATUS_FAILED &&
      nextUser.failedSignInAttempts > 0

    if (nextUser.status === Constants.STATUS_NOT_FOUND) {
      this.error = 'Authentication API unreachable'
    } else if (hasFailed) {
      this.error = `Email not found or ${isTokenSignin ? 'token invalid' : 'password incorrect'}`
    } else {
      this.error = null
    }
  }

  render() {
    const {state, actions, isTokenSignin, setPagetTitle, token} = this.props
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
    const {formDataIsValid} = this.state

    setPagetTitle('Sign In')

    return (
      <div class={styles.wrapper}>
        <div class={styles.overlay}>
          <div class={styles.container}>
            <form
              action="/profile"
              method="POST"
              onSubmit={this.handleSignIn.bind(this)}
            >
              <img class={styles.logo} src="/images/publish.png" />

              {this.error &&
                <Banner>{this.error}</Banner>
              }

              <div class={styles.inputs}>
                <div class={styles.input}>
                  <Label label="Email">
                    <TextInput
                      placeholder="Your email address"
                      validation={this.validation.email}
                      onChange={this.handleInputChange.bind(this, 'email')}
                      onKeyUp={this.handleInputChange.bind(this, 'email')}
                      value={this.state.email}
                    />
                  </Label>
                </div>

                {isTokenSignin && (
                  <div class={styles.input}>
                    <Label label="Token">
                      <TextInput
                        type="text"
                        placeholder="Password reset Token"
                        onChange={this.handleInputChange.bind(this, 'token')}
                        value={token}
                      />
                    </Label>
                  </div>
                )}
                <div class={styles.input}>
                  <Label label={isTokenSignin ? 'New Password' : 'Password'}>
                    <TextInput
                      type="password"
                      placeholder={isTokenSignin ? 'Your new Password' : 'Your Password'}
                      onChange={this.handleInputChange.bind(this, 'password')}
                      value={this.state.password}
                    />
                  </Label>
                </div>
                {isTokenSignin && (
                  <div class={styles.input}>
                    <Label label="Confirm new Password">
                      <TextInput
                        type="password"
                        placeholder="Confirm new Password"
                        onChange={this.handleInputChange.bind(this, 'passwordConfirm')}
                        value={this.state.passwordConfirm}
                      />
                    </Label>
                  </div>
                )}
              </div>

              <Button
                accent="system"
                disabled={hasConnectionIssues || !formDataIsValid}
                type="submit"
                label={isTokenSignin ? 'Reset password': 'Sign In'}
              />
              {!isTokenSignin && (
                <a class={styles.link} href="/reset">Reset password</a>
              )}
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

  handleSignIn(event) {
    const {actions} = this.props
    const {email, password} = this.state

    actions.signIn(email, password)

    event.preventDefault()
  }
}

export default connectHelper(
  state => ({
    user: state.user,
    app: state.app
  }),
  dispatch => bindActionCreators({
    ...userActions
  }, dispatch)
)(SignIn)

