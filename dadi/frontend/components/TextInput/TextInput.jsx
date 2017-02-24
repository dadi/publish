'use strict'

import { h, Component } from 'preact'

import styles from './TextInput.css'

export default class TextInput extends Component {
  render() {
    return (
      <input
        class={styles.input}
        type={this.props.type || "text"}
        value={this.props.value}
        id={this.props.id}
        placeholder={this.props.placeholder}
        required={this.props.required}
        onChange={this.props.onChange}
      />
    )
  }

  // _onKeyUp(e) {
  //   const context = this
  //   const value = e.target.value
  //   const delay = this.props.delay || config.ui.inputDelay

  //   clearTimeout(this._timeout)
  //   this._timeout = setTimeout(() => {
  //     context._onUpdate(value)
  //   }, delay)
  // }

  // _onUpdate(value) {
  //   this.props.onUpdate && this.props.onUpdate(value)
  // }
}
