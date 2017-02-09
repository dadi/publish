'use strict'

import { h, Component } from 'preact'

import Styles from './TextInput.scss'

export default class TextInput extends Component {
  render() {
    return (
      <input
        type="text"
        class="TextInput"
        value={this.props.value}
        onKeyUp={this._onKeyUp.bind(this)} />
    )
  }

  _onKeyUp(e) {
    const context = this
    const value = e.target.value
    const delay = this.props.delay || config.ui.inputDelay

    clearTimeout(this._timeout)
    this._timeout = setTimeout(() => {
      context._onUpdate(value)
    }, delay)
  }

  _onUpdate(value) {
    this.props.onUpdate && this.props.onUpdate(value)
  }
}
