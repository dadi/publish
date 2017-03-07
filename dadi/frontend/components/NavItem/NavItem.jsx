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
    active: proptypes.bool,

    /**
     * The link to be followed when the navigation item is clicked.
     */
    href: proptypes.string,

    /**
     * Whether the navigation item is part of a navigation component in mobile mode.
     */
    mobile: proptypes.bool
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
    let containerClass = new Style(styles, 'container')
    let navItemClass = new Style(styles, 'nav-item')

    containerClass.addIf('container-desktop', !this.props.mobile)
    containerClass.addIf('container-expanded', this.state.expanded)

    navItemClass.addIf('nav-item-active', this.props.active)

    return (
      <li
        class={containerClass.getClasses()}
        onMouseEnter={this.toggleExpanded.bind(this, true)}
        onMouseLeave={this.toggleExpanded.bind(this, false)}
        onClick={this.toggleExpanded.bind(this, false)}
      >
        <a
          class={navItemClass.getClasses()}
          href={this.props.href}
        >
          {this.props.text}
        </a>

        {this.props.children.length ?
          <div class={styles.children}>
            {this.props.children}
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
