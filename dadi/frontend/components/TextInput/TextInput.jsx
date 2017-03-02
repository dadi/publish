'use strict'

import { h, Component } from 'preact'

import Style from 'lib/Style'
import styles from './TextInput.css'

export default class TextInput extends Component {
  static defaultProps = {
    inLabel: false,
    type: 'text'
  }

  render() {
    let inputStyle = new Style(styles, 'input')

    inputStyle.addIf('input-in-label', this.props.inLabel)

    return (
      <input
        class={inputStyle.getClasses()}
        type={this.props.type}
        value={this.props.value}
        id={this.props.id}
        placeholder={this.props.placeholder}
        required={this.props.required}
        onChange={this.props.onChange}
      />
    )
  }
}
