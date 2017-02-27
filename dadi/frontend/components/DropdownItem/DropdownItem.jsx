'use strict'

import { h, Component } from 'preact'

import { Style } from 'lib/util'
import styles from './DropdownItem.css'

export default class DropdownItem extends Component {
  handleClick(event) {
    event.stopPropagation()

    // If there is an onClick event registered, fire it
    if (this.props.onClick) {
      this.props.onClick(event)
    }
  }

  constructor(props) {
    super(props)
  }

  render() {
    // Should we render an achor?
    if (this.props.href) {
      return (
        <a
          class={styles.item}
          href={this.props.href}
          onClick={this.handleClick.bind(this)}
        >
          {this.props.children}
        </a>
      )
    }

    // Otherwise, we'll render a button
    return (
      <button 
        class={styles.item}
        type="button"
        onClick={this.handleClick.bind(this)}
      >
        {this.props.children}
      </button>
    )
  }
}
