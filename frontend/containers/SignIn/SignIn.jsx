'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'
import {connect} from 'preact-redux'
import {connectHelper} from 'lib/util'
import {route} from '@dadi/preact-router'
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
    this.state.email = ''
    this.state.password = ''
    this.state.passwordConfirm = ''
    this.state.formDataIsValid = false
    this.state.error = false
  }

  getErrorBanner(signInError) {
    let message

    if (signInError) {
      switch (signInError) {
        case 401:
          message = 'Email not found or password incorrect'

          break

        default:
          message = 'The API is not responding'

          break
      }
    }

    if (message) {
      return (
        <Banner>{message}</Banner>
      )      
    }

    return null
  }

  render() {
    const {state, actions, setPagetTitle} = this.props
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
    const {formDataIsValid} = this.state

    setPagetTitle('Sign In')

    return (
      <div class={styles.wrapper}>
        <div class={styles.overlay}>
          <div class={styles.container}>
            <form
              method="POST"
              onSubmit={this.handleSignIn.bind(this)}
            >
              <img class={styles.logo} src="/public/images/publish.png" />

              {this.getErrorBanner(state.user.failedSignInError)}

              <div class={styles.inputs}>
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

                <div class={styles.input}>
                  <Label label="Password">
                    <TextInput
                      onChange={this.handleInputChange.bind(this, 'password')}
                      placeholder={"Your password"}
                      type="password"
                      value={this.state.password}
                    />
                  </Label>
                </div>
              </div>

              <Button
                accent="system"
                disabled={hasConnectionIssues || !formDataIsValid}
                type="submit"
              >Sign In</Button>

              <a class={styles.link} href="/reset">Reset password</a>
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
    const {email, password, passwordConfirm} = this.state

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

