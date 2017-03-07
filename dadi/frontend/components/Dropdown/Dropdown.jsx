'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Dropdown.css'

/**
 * A list of grouped links.
 */
export default class Dropdown extends Component {
  static propTypes = {
    /**
     * The list of `DropdownItem` elements to be rendered.
     */
    children: proptypes.node
  }

  render() {
    return (
      <ul class={styles.container}>
        {this.props.children}
      </ul>
    )
  }
}
