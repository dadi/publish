'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Dropdown.css'

/**
 * A `Dropdown` item.
 */
export default class DropdownItem extends Component {
  static propTypes = {
    /**
     * When present, the item is rendered as a `<a>` linking to the content of this prop. Otherwise, it will be rendered as a `<button>`
     */
    href: proptypes.string,

    /**
     * Callback to be executed when the item is clicked.
     */
    onClick: proptypes.func,

    /**
     * The list of `DropdownItem` elements to be rendered.
     */
    children: proptypes.node
  }

  static defaultProps = {
    href: false
  }

  handleClick(event) {
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
          type="button"
          onClick={this.handleClick.bind(this)}
        >
          {this.props.children}
        </button>
      </li>
    )
  }
}
