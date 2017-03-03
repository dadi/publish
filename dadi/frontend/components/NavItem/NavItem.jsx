'use strict'

import {h, Component} from 'preact'

import Style from 'lib/Style'
import styles from './NavItem.css'

export default class NavItem extends Component {
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
