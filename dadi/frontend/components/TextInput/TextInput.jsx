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
}
