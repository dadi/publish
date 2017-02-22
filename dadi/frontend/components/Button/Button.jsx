'use strict'

import { h, Component } from 'preact'

import styles from './Button.css'

export default class Button extends Component {
  render() {
    let accent = (this.props.accent && styles[`button-${this.props.accent}`]) ? ' ' + styles[`button-${this.props.accent}`] : ''

    return (
      <button type="button"
              class={styles.button + accent}
              onClick={this.props.onClick}>{this.props.children}</button>
    )
  }
}
