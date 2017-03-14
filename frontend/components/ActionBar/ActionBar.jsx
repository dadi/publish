'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ActionBar.css'

/**
 * A list of grouped links.
 */
export default class ActionBar extends Component {
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
