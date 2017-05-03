import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {route} from 'preact-router'
import {bindActionCreators} from 'redux'
import {connectHelper, isEmpty, setPageTitle} from 'lib/util'

import * as userActions from 'actions/userActions'
import * as Constants from 'lib/constants'

import Banner from 'components/Banner/Banner'
import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

import styles from './SignInView.css'

class SignInView extends Component {

  constructor(props) {
    super(props)

    this.state.email = ''
    this.state.password = ''
    this.state.error = false
  }

  componentWillUpdate(nextProps, nextState) {
    const {actions, state} = this.props
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
      this.error = 'Email not found or password incorrect'
    } else {
      this.error = null
    }
  }

  render() {
    const {state, actions} = this.props
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK

    setPageTitle('Sign-in')

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
                disabled={hasConnectionIssues}
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
      [name]: event.target.value
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
  dispatch => bindActionCreators(userActions, dispatch)
)(SignInView)
