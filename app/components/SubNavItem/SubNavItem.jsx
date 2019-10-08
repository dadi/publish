import {Link} from 'react-router-dom'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './SubNavItem.css'

/**
 * An item of the main navigation component.
 */
export default class SubNavItem extends React.Component {
  static propTypes = {
    /**
     * Whether the component corresponds to the currently active page.
     */
    active: proptypes.bool,

    /**
     * Whether the navigation item contains an error.
     */
    error: proptypes.bool,

    /**
     * The link to be followed when the navigation item is clicked.
     */
    href: proptypes.string,

    /**
     * The text to be rendered inside the navigation item.
     */
    children: proptypes.node
  }

  static defaultProps = {
    active: false,
    error: false
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {active, children, error, href, inDropdown, onClick} = this.props
    const itemStyle = new Style(styles, 'sub-nav-item')
      .addIf('active', active)
      .addIf('error', error)
      .addIf('in-dropdown', inDropdown)

    return (
      <Link className={itemStyle.getClasses()} onClick={onClick} to={href}>
        {children}
      </Link>
    )
  }
}
