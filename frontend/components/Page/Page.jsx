'use strict'

import {h, Component} from 'preact'
import styles from './Page.css'

/**
 * A container that wraps a view/page.
 */
export default class Page extends Component {
  render() {
    return (
      <div class={styles.container}>
        {this.props.children}
      </div>
    )
  }
}
