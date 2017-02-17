'use strict'

import { h, Component } from 'preact'

// import Styles from './SignInForm.scss'
import SubmitButton from '../../components-old/SubmitButton/SubmitButton'
import FormPassword from '../../components-old/FormPassword/FormPassword'
import FormTextInput from '../../components-old/FormTextInput/FormTextInput'

export default class SignInForm extends Component {
  render() {
    const { onSubmit } = this.props
    return (
      <form class="SignInForm" onSubmit={ onSubmit }>
        <FormTextInput name="loginUsername" />
        <FormPassword name="loginPassword" />
        <SubmitButton 
          value="Sign in" 
        />
      </form>
    )
  }
}