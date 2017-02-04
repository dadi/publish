'use strict'

import { h, Component } from 'preact'

import Styles from './Card.scss'

export default class Card extends Component {
  render() {
    return (
      <div class="Card">
        {this.props.children}
      </div>
    )
  }
}
