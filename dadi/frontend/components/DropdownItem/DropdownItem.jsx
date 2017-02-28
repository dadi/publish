'use strict'

import { h, Component } from 'preact'

import { Style } from 'lib/util'
import styles from './DropdownItem.css'

export default class DropdownItem extends Component {
  handleClick (event) {
    // Don't stop propagation for anchor node
    if (!this.props.href) {
      event.stopPropagation()
    }

    // If there is an onClick event registered, fire it
    if (this.props.onClick) {
      this.props.onClick(event)
    }
  }

  constructor (props) {
    super(props)
  }

  render () {
    // Should we render an achor?
    if (this.props.href) {
      return (
        <li>
          <a
            class={styles.item}
            href={this.props.href}
            onClick={this.handleClick.bind(this)}
          >
            {this.props.children}
          </a>
        </li>
      )
    }

    // Otherwise, we'll render a button
    return (
      <li>
        <button
          class={styles.item}
          type='button'
          onClick={this.handleClick.bind(this)}
        >
          {this.props.children}
        </button>
      </li>
    )
  }
}
