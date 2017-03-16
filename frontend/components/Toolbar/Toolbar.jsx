'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Toolbar.css'

/**
 * A toolbar that sits fixed at the bottom of the screen. Each immediate
 * child is seen as a group, and groups are horizontally distributed across
 * the width of the page.
 */
export default class Toolbar extends Component {
  static propTypes = {
    /**
     * The elements to be rendered inside the bar.
     */
    children: proptypes.node
  }

  render() {
    return (
      <footer class={styles.container}>
        {this.props.children}
      </footer>
    )
  }
}
