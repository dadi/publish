import { h, Component } from 'preact'

import Styles from './Modal.scss'

export default class Modal extends Component {
  render() {
    return (
      <div class="Modal">
        <div class="modal">
          {this.props.children}
        </div>
      </div>
    )
  }
}
