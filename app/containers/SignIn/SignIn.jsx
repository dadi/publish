import * as Constants from 'lib/constants'
import * as userActions from 'actions/userActions'
import {Button, TextInput} from '@dadi/edit-ui'
import {connectRedux} from 'lib/redux'
import {Error} from '@material-ui/icons'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
import {Redirect} from 'react-router-dom'
import SpinningWheel from 'components/SpinningWheel/SpinningWheel'
import styles from './SignIn.css'

class SignIn extends React.Component {
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

  constructor(props) {
    super(props)

    this.state = {
      email: '',
      error: false,
      password: '',
      userHasInteracted: false
    }
  }

  getErrorBanner({noAPIConfigured, remoteError, sessionHasExpired}) {
    let message

    if (noAPIConfigured) {
      message =
        'This installation of Edit has not been configured. Please contact your administrator.'
    } else if (sessionHasExpired) {
      message = 'Your session has expired. Please sign in again.'
    } else if (remoteError) {
      switch (remoteError) {
        case 401:
          message = 'Username not found or password incorrect'

          break

        case 501:
          message =
            'The API is running an earlier version than that required by this version of Edit'

          break

        case 'NO-CORS':
          message = 'API Cross Origin support appears to be disabled'

          break

        default:
          message = 'The API is not responding'

          break
      }
    }

    if (!message) return null

    return (
      <div className={styles['error-container']}>
        <Error />
        <p className={styles['error-text']}>{message}</p>
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
    const {actions} = this.props
    const {email, password} = this.state

    actions.signIn(email, password)

    event.preventDefault()
  }

  render() {
    const {setPageTitle, state} = this.props
    const {email, password, userHasInteracted} = this.state
    const {config, isLoading, networkStatus} = state.app
    const {api, whitelabel} = config
    const {logoDark, poweredBy, backgroundImage} = whitelabel
    const hasConnectionIssues = networkStatus !== Constants.NETWORK_OK

    if (state.user.isSignedIn) {
      return <Redirect to="/" />
    }

    setPageTitle('Sign In')

    const formDataIsValid = this.validate()

    return (
      <div
        className={styles.wrapper}
        style={{backgroundImage: `url(/_public/${backgroundImage})`}}
      >
        <div className={styles.overlay}>
          <div className={styles.container}>
            {isLoading && <SpinningWheel />}

            <form method="POST" onSubmit={this.handleSignIn.bind(this)}>
              <img className={styles.logo} src={`/_public/${logoDark}`} />

              {this.getErrorBanner({
                noAPIConfigured: !api,
                remoteError: state.user.remoteError,
                sessionHasExpired: state.user.sessionHasExpired
              })}

              <div className={styles.inputs}>
                <div className={styles.input}>
                  <Label label="Username">
                    <TextInput
                      autoFocus={true}
                      name="username"
                      onChange={this.handleInputChange.bind(this, 'email')}
                      onInput={this.handleInputChange.bind(this, 'email')}
                      placeholder="Your username"
                      autocapitalize="none"
                      value={email}
                    />
                  </Label>
                </div>

                <div className={styles.input}>
                  <Label label="Password">
                    <TextInput
                      name="password"
                      onChange={this.handleInputChange.bind(this, 'password')}
                      onInput={this.handleInputChange.bind(this, 'password')}
                      placeholder={'Your password'}
                      type="password"
                      value={password}
                    />
                  </Label>
                </div>
              </div>

              <Button
                accent="positive"
                disabled={
                  hasConnectionIssues ||
                  (userHasInteracted && !formDataIsValid) ||
                  !api
                }
                fillStyle="filled"
                isLoading={state.user.isAuthenticating}
                type="submit"
              >
                Sign In
              </Button>

              {poweredBy && (
                <p className={styles['powered-by']}>
                  <span>Powered by</span>
                  <a href="https://dadi.cloud/publish/" target="_blank">
                    <img src="/_public/images/publish.png" height="25" />
                  </a>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    )
  }

  validate() {
    const {email, password} = this.state

    return email.length > 0 && password.length > 0
  }
}

export default connectRedux(userActions)(SignIn)
