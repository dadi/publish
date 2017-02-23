'use strict'

import { h, Component } from 'preact'

import { Style } from 'lib/util'
import styles from './Dropdown.css'

export default class Dropdown extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <ul class={styles.container}>
        {this.props.children}
      </ul>
    )
  }
}
