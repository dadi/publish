'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './NavItem.css'

/**
 * An item of the main navigation component.
 */
export default class NavItem extends Component {
  static propTypes = {
    /**
     * Whether the component corresponds to the currently active page.
     */
    active: proptypes.bool.isRequired,

    /**
     * The link to be followed when the navigation item is clicked.
     */
    href: proptypes.string.isRequired,

    /**
     * Whether the navigation item is part of a navigation component in mobile mode.
     */
    mobile: proptypes.bool.isRequired,

    /**
     * Text content for navigation anchor. 
     */
    text: proptypes.string.isRequired
  }

  static defaultProps = {
    active: false,
    mobile: false
  }

  constructor(props) {
    super(props)

    this.state.expanded = false
  }

  static defaultProps = {
    mobile: false
  }

  render() {
    const {
      active,
      children,
      href,
      mobile,
      text
    } = this.props
    let containerClass = new Style(styles, 'container')
    let navItemClass = new Style(styles, 'nav-item')

    containerClass.addIf('container-desktop', !mobile)
    containerClass.addIf('container-expanded', this.state.expanded)

    navItemClass.addIf('nav-item-active', active)

    if (!text) return null

    return (
      <li
        class={containerClass.getClasses()}
        onMouseEnter={this.toggleExpanded.bind(this, true)}
        onMouseLeave={this.toggleExpanded.bind(this, false)}
        onClick={this.toggleExpanded.bind(this, false)}
      >
        <a
          class={navItemClass.getClasses()}
          href={href}
        >
          <span>{text}</span>
        </a>

        {children.length ?
          <div class={styles.children}>
            {children}
          </div>
          : null
        }
      </li>
    )
  }

  toggleExpanded(expanded, event) {
    this.setState({
      expanded
    })
  }
}
