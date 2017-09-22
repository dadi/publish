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
     * Whether the item is in an active state.
     */
    active: proptypes.bool,

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
    active: false,
    href: false
  }

  handleClick(event) {
    // If there is an onClick event registered, fire it
    if (typeof this.props.onClick === 'function') {
      this.props.onClick(event)
    }
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {
      active,
      children,
      href
    } =  this.props
    let itemStyle = new Style(styles, 'dropdown-item')

    itemStyle.addIf('dropdown-item-active', active)

    // Should we render an achor?
    if (href) {
      return (
        <li>
          <a
            class={itemStyle.getClasses()}
            href={href}
            onClick={this.handleClick.bind(this)}
          >
            {children}
          </a>
        </li>
      )
    }

    // Otherwise, we'll render a button
    return (
      <li>
        <button
          class={itemStyle.getClasses()}
          type="button"
          onClick={this.handleClick.bind(this)}
        >
          {children}
        </button>
      </li>
    )
  }
}
