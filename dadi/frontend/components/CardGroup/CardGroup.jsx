'use strict'

import { h, Component } from 'preact'

import Styles from './CardGroup.scss'

export default class CardGroup extends Component {
  render() {
    const cardGroupItems = this.props.children.map(i => {
      return (
        <div class="CardGroupItem">
          {i}
        </div>
      )
    })
    return (
      <div class="CardGroup">
        {cardGroupItems}
      </div>
    )
  }
}
