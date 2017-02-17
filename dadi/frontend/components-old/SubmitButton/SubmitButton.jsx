'use strict'

import { h, Component } from 'preact'

export default class SubmitButton extends Component {
  render() {
    return (
      <input
        type="submit"
        class="SubmitButton"
        value={this.props.value || 'Submit'}
        onClick={this.props.onClick} />
    )
  }
}
