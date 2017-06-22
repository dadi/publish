'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'
import {connect} from 'preact-redux'
import {connectHelper} from 'lib/util'
import {route} from 'preact-router'
import {redirectIf} from 'lib/router'
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
      * Sign in token.
      */
     token: proptypes.string
  }

  constructor(props) {
    super(props)

    this.validation = new Validation()
    // Is there is a token in the URL.
    this.state.isPasswordReset = typeof props.token === 'string' && props.token.length
    this.state.email = ''
    this.state.password = ''
    this.state.passwordConfirm = ''
    this.state.formDataIsValid = false
    this.state.error = false
  }

  componentWillUpdate(nextProps, nextState) {
    const {actions, state} = this.props
    const {user, isPasswordReset} = state
    const nextUser = nextProps.state.user
    const {resetSuccess} = nextUser

    // If the user is signed in, redirect to the home view.
    redirectIf(user.remote, '/')

    // Redirect if `resetSuccess` true
    redirectIf(!user.resetSuccess && (resetSuccess && isPasswordReset), '/sign-in')

    // Reset `isPasswordReset`
    if (!user.resetSuccess && resetSuccess) {
      this.setState({isPasswordReset: false})
    }

    const hasFailed = nextUser.status !== Constants.STATUS_LOADED &&
      nextUser.failedSignInAttempts > 0

    if (hasFailed) {
      if (nextUser.status === Constants.AUTH_UNREACHABLE) {
        this.setState({error: 'Authentication API unreachable'})
      } else {
        this.setState({error:`${isPasswordReset ? 'Passwords don\'t match or invalid token' : 'Email not found or password incorrect'}.`})
      }
    } else {
      this.setState({error: false})
    }
  }

  render() {
    const {state, actions, setPagetTitle} = this.props
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
    const {formDataIsValid, error, isPasswordReset} = this.state
    const formActionLabel = isPasswordReset ? 'Reset password' : 'Sign In'

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
              <img class={styles.logo} src="/public/images/publish.png" />

              {error &&
                <Banner>{error}</Banner>
              }

              <div class={styles.inputs}>
                {!isPasswordReset && (
                  <div class={styles.input}>
                    <Label label="Email">
                      <TextInput
                        onChange={this.handleInputChange.bind(this, 'email')}
                        onKeyUp={this.handleInputChange.bind(this, 'email')}
                        placeholder="Your email address"
                        validation={this.validation.email}
                        value={this.state.email}
                      />
                    </Label>
                  </div>
                )}

                <div class={styles.input}>
                  <Label label={isPasswordReset ? 'New Password' : 'Password'}>
                    <TextInput
                      onChange={this.handleInputChange.bind(this, 'password')}
                      placeholder={isPasswordReset ? 'Your new Password' : 'Your Password'}
                      type="password"
                      value={this.state.password}
                    />
                  </Label>
                </div>
                {isPasswordReset && (
                  <div class={styles.input}>
                    <Label label="Confirm new Password">
                      <TextInput
                        onChange={this.handleInputChange.bind(this, 'passwordConfirm')}
                        placeholder="Confirm new Password"
                        type="password"
                        value={this.state.passwordConfirm}
                      />
                    </Label>
                  </div>
                )}
              </div>

              <Button
                accent="system"
                disabled={hasConnectionIssues || (!formDataIsValid && !isPasswordReset)}
                type="submit"
              >{formActionLabel}</Button>

              {!isPasswordReset && (
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
    const {actions, token} = this.props
    const {email, password, isPasswordReset, passwordConfirm} = this.state

    if (isPasswordReset) {
      if (password === passwordConfirm) {
        actions.passwordReset(token, password)
      } else {
        this.setState({error: Constants.PASSWORD_MISMATCH})
      }
    } else {
      actions.signIn(email, password)
    }

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

