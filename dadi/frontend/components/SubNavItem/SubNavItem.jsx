'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './SubNavItem.css'

/**
 * An item of the main navigation component.
 */
export default class SubNavItem extends Component {
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

  static defaultProps = {
    mobile: false
  }

  render() {
    const {active, error, href} = this.props

    let itemStyle = new Style(styles, 'sub-nav-item')

    itemStyle.addIf('sub-nav-item-active', active)
    itemStyle.addIf('sub-nav-item-error', error)

    return (
      <a class={itemStyle.getClasses()} href={href}>{this.props.children}</a>
    )
  }
}
