'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'
import {connect} from 'preact-redux'
import {connectHelper} from 'lib/util'
import {route} from '@dadi/preact-router'
import {redirectIf} from 'lib/router'

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
     setPageTitle: proptypes.func,

     /**
      * Sign in token.
      */
     token: proptypes.string
  }

  componentDidMount() {
    const {
      state
    } = this.props

    // If the user is already signed in, let's take them to
    // the root page.
    if (state.user.accessToken) {
      return route('/')
    }
  }

  state = {
    email: '',
    error: false,
    password: '',
    userHasInteracted: false
  }

  getErrorBanner(signInError) {
    let message

    if (signInError) {
      switch (signInError) {
        case 401:
          message = 'Username not found or password incorrect'

          break

        case 501:
          message = 'The API is running an earlier version than that required by this version of Publish'

          break

        case 'NO-CORS':
          message = 'API Cross Origin support appears to be disabled'

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
    const {state, actions, setPageTitle} = this.props
    const {email, password, userHasInteracted} = this.state
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
    const {
      whitelabel: {logo, poweredBy, backgroundImage}
    } = state.app.config || {
      whitelabel: {logo: '', poweredBy: false, backgroundImage: ''}
    }

    setPageTitle('Sign In')

    let formDataIsValid = this.validate()

    return (
      <div class={styles.wrapper} style={backgroundImage.length ? `background-image: url(${backgroundImage}` : ''}>
        <div class={styles.overlay}>
          <div class={styles.container}>
            <form
              method="POST"
              onSubmit={this.handleSignIn.bind(this)}
            >
              <img class={styles.logo} src={logo} />

              {this.getErrorBanner(state.user.remoteError)}

              <div class={styles.inputs}>
                <div class={styles.input}>
                  <Label label="Username">
                    <TextInput
                      onChange={this.handleInputChange.bind(this, 'email')}
                      onKeyUp={this.handleInputChange.bind(this, 'email')}
                      placeholder="Your username"
                      value={email}
                    />
                  </Label>
                </div>

                <div class={styles.input}>
                  <Label label="Password">
                    <TextInput
                      onChange={this.handleInputChange.bind(this, 'password')}
                      onKeyUp={this.handleInputChange.bind(this, 'password')}
                      placeholder={"Your password"}
                      type="password"
                      value={password}
                    />
                  </Label>
                </div>
              </div>

              <Button
                accent="system"
                disabled={hasConnectionIssues || (userHasInteracted && !formDataIsValid)}
                type="submit"
              >Sign In</Button>

              {/*<a class={styles.link} href="/reset">Reset password</a>*/}

              {poweredBy && (
                <p class={styles['powered-by']}>
                  Powered by <a href="https://dadi.cloud/en/publish/" target="_blank">DADI Publish</a>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    )
  }

  handleInputChange(name, event) {
    // We use the `userHasInteracted` property to determine whether the user
    // has actively interacted with the form. We can't disable the submit
    // button until this has been the case, because the user might have
    // the browser's autofill feature filling in the form for them on first
    // render, which annoyingly doesn't fire the `onChange` event in some
    // browsers. To avoid showing a disabled button in those cases, we can
    // only disable the button once the user has started their interaction.
    this.setState({
      [name]: event.target.value,
      userHasInteracted: true
    })
  }

  handleSignIn(event) {
    const {actions, token} = this.props
    const {email, password, passwordConfirm} = this.state

    actions.signIn(email, password)

    event.preventDefault()
  }

  validate() {
    const {email, password} = this.state

    return (email.length > 0) && (password.length > 0)
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

