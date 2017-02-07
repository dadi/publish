'use strict'

import { h, Component } from 'preact'

export default class Debug extends Component {
  render() {
    const { val } = this.props
    return (
      <p class="Debug">{val}</p>
    )
  }
}