'use strict'

import {h, Component} from 'preact'

import Style from 'lib/Style'
import {getUniqueId} from 'lib/util'

import styles from './Label.css'

export default class Label extends Component {
  constructor(props) {
    super(props)

    this.state.error = false
  }

  componentWillMount() {
    this.id = getUniqueId()
  }

  // This will render all children and inject an `id` prop
  // with the generated unique id
  renderChildren() {
    return this.props.children.map(child => {
      child.attributes = child.attributes || {}
      child.attributes.id = child.attributes.id || this.id

      // Inject 'inLabel' to children
      child.attributes.inLabel = true

      // Inject 'required' to children
      if (this.props.required) {
        child.attributes.required = true
      }

      return child
    })
  }  

  render() {
    let comment
    let labelStyle = new Style(styles, 'container')

    labelStyle.addIf('container-error', this.state.error)

    if (this.props.required) {
      comment = 'Required'
    } else if (this.props.optional) {
      comment = 'Optional'
    }

    return (
      <div class={labelStyle.getClasses()}>
        <label
          for={this.id}
          class={styles.label}
        >
          {this.props.label}
        </label>

        {comment &&
          <sub class={styles.comment}>{comment}</sub>
        }

        {this.renderChildren()}
      </div>
    )
  }
}
