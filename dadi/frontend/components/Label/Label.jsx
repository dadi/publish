'use strict'

import { h, Component } from 'preact'

import styles from './Label.css'
import { getUniqueId } from 'lib/util'

export default class Label extends Component {
  componentWillMount() {
    this.id = getUniqueId()
  }

  // This will render all children and inject an `id` prop
  // with the generated unique id
  renderChildren() {
    return this.props.children.map(child => {
      child.attributes = child.attributes || {}
      child.attributes.id = child.attributes.id || this.id

      // Inject 'required' to children
      if (this.props.required) {
        child.attributes.required = true
      }

      return child
    })
  }  

  render() {
    let comment

    if (this.props.required) {
      comment = 'Required'
    } else if (this.props.optional) {
      comment = 'Optional'
    }

    return (
      <div class={styles.container}>
        <label for={this.id} class={styles.label}>{this.props.label}</label>

        {comment &&
          <sub class={styles.comment}>{comment}</sub>
        }

        {this.renderChildren()}
      </div>
    )
  }
}
