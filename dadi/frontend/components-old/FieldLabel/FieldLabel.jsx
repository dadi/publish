'use strict'

import { h, Component } from 'preact'

import styles from './FieldLabel.css'
import { getUniqueId } from 'lib/util'

export default class FieldLabel extends Component {
  componentWillMount () {
    this.id = getUniqueId()
  }

  // This will render all children and inject an `id` prop
  // with the generated unique id
  renderChildren() {
    return this.props.children.map(child => {
      child.attributes.id = child.attributes.id || this.id

      return child
    })
  }  

  render() {
    return (
      <div>
        <label for={this.id}></label>

        {this.renderChildren()}
      </div>
    )
  }
}
