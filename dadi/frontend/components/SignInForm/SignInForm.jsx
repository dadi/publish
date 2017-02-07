'use strict'

import { h, Component } from 'preact'

// import Styles from './SignInForm.scss'
import SubmitButton from '../../components/SubmitButton/SubmitButton'
import FormPassword from '../../components/FormPassword/FormPassword'
import FormTextInput from '../../components/FormTextInput/FormTextInput'

export default class SignInForm extends Component {
  render() {
    const { onSubmit } = this.props
    return (
      <form class="SignInForm" onSubmit={onSubmit}>
        <FormTextInput name="loginUsername" />
        <FormPassword name="loginPassword" />
        <SubmitButton 
          value="Sign in" 
        />
      </form>
    )
  }
}

/*
{this.props.children}
<form onSubmit={this.signIn}>
          <label> username:
            <input type="text" />
          </label>
          <label> password:
            <input type="password" />
          </label>
          <SubmitButton 
            value="Sign in" 
          />
        </form>
        <SubmitButton
          value="Sign out"
          onClick={actions.signOut}
          />
 */
