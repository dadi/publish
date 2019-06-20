import {Link} from 'react-router-dom'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Dropdown.css'

/**
 * A `Dropdown` item.
 */
export default class DropdownItem extends React.Component {
  static propTypes = {
    /**
     * Whether the item is in an active state.
     */
    active: proptypes.bool,

    /**
     * When present, the item is rendered as a `<a>` linking to the content of
     * this prop. Otherwise, it will be rendered as a `<button>`
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
    active: false
  }

  render() {
    const {active, children, href, onClick} = this.props
    const itemStyle = new Style(styles, 'dropdown-item').addIf(
      'dropdown-item-active',
      active
    )

    // If the `href` prop is set, we render a link.
    if (href) {
      return (
        <li>
          <Link className={itemStyle.getClasses()} to={href}>
            {children}
          </Link>
        </li>
      )
    }

    // Otherwise, we render a button.
    return (
      <li>
        <button
          className={itemStyle.getClasses()}
          onClick={onClick}
          type='button'
        >
          {children}
        </button>
      </li>
    )
  }
}
