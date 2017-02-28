'use strict'

import { h, Component } from 'preact'

import { Style } from 'lib/util'
import styles from './NavItem.css'

export default class NavItem extends Component {
  render() {
    let containerClass = new Style(styles, 'container')
    let navItemClass = new Style(styles, 'nav-item')

    if (!this.props.compact) {
      containerClass.add('container-collapsed')
    }

    if (this.props.active) {
      navItemClass.add('nav-item-active')
    }

    return (
      <li class={containerClass.getClasses()}>
        <a
          class={navItemClass.getClasses()}
          href={this.props.href}
        >
          {this.props.text}
        </a>

        <div class={styles.children}>
          {this.props.children}
        </div>
      </li>
    )
  }
}
