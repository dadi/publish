'use strict'

import { h, Component } from 'preact'

import { Style } from 'lib/util'
import styles from './NavItem.css'

export default class NavItem extends Component {
  render() {
    let navItemClass = new Style(styles)

    navItemClass.add('nav-item')

    if (this.props.active) {
      navItemClass.add('nav-item-active')
    }

    return (
      <div class={styles.container}>
        <a
          class={navItemClass.getClasses()}
          href={this.props.href}
        >
          {this.props.text}
        </a>

        <div class={styles.reveal}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
