'use strict'

import { h, Component } from 'preact'

// import Styles from './FormPassword.scss'

export default class FormPassword extends Component {
  render() {
    const { name } = this.props
    return (
      <input type="password" name={ name } />
    )
  }
}