'use strict'

import { h, Component } from 'preact'

// import Styles from './FormTextInput.scss'

export default class FormTextInput extends Component {
  render() {
    const { name } = this.props
    return (
      <input type="text" name={ name } />
    )
  }
}