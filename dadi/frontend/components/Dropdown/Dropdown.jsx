'use strict'

import {h, Component} from 'preact'

import Style from 'lib/Style'
import styles from './Dropdown.css'

export default class Dropdown extends Component {
  render() {
    return (
      <ul class={styles.container}>
        {this.props.children}
      </ul>
    )
  }
}
