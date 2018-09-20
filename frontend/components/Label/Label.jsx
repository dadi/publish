'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import {getUniqueId} from 'lib/util'

import styles from './Label.css'

/**
 * A label to wrap any type of input field.
 */
export default class Label extends Component {
  static propTypes = {
    /**
     * The input element to be rendered inside the label.
     */
    children: proptypes.node,

    /**
     * Classes to append to the label container.
     */
    className: proptypes.string,

    /**
     * The text to be rendered on the top-right corner of the label.
     */
    comment: proptypes.string,

    /**
     * Whether the label is in compact mode, which will render the label text
     * and the children on the same line.
     */
    compact: proptypes.bool,

    /**
     * Whether there's an error in the label field.
     */
    error: proptypes.bool,

    /**
     * An error message to display on the label.
     */
    errorMessage: proptypes.string,

    /**
     * The text to be rendered inside the label.
     */
    label: proptypes.string.isRequired,

    /**
     * Should apply a required attribute to all children.
     */
    required: proptypes.bool.isRequired
  }

  static defaultProps = {
    compact: false,
    error: false,
    errorMessage: null,
    required: false
  }

  componentWillMount() {
    this.id = getUniqueId()
  }

  // This will render all children and inject an `id` prop
  // with the generated unique id in the first child.
  renderChildren() {
    const {
      children,
      error,
      required
    } = this.props

    return children.map((child, index) => {
      if (child && typeof child === 'object') {
        child.attributes = child.attributes || {}

        if (index === 0) {
          child.attributes.id = child.attributes.id || this.id
        }

        // Inject 'inLabel' to children
        child.attributes.inLabel = true

        // Inject 'error' to children
        if (error) {
          child.attributes.error = true
        }

        // Inject 'required' to children
        if (required) {
          child.attributes.required = true
        }
      }

      return child
    })
  }  

  render() {
    let {
      className,
      comment,
      compact,
      label,
      error,
      errorMessage
    } = this.props
    const labelStyle = new Style(styles, 'container')
      .addIf('container-compact', compact)
      .addIf('container-error', error)
      .addIf('container-error-message', errorMessage)
      .addIf('container-with-comment', comment)
      .addResolved(className)

    if (
      (label && typeof label !== 'string') ||
      (comment && typeof comment !== 'string') ||
      (errorMessage && typeof errorMessage !== 'string')
    ) {
      return null
    }

    label = label || ''

    return (
      <label for={this.id} class={labelStyle.getClasses()}>
        {this.renderChildren()}

        <div
          class={styles.label}
        >
          {label}
        </div>

        {comment &&
          <sub class={styles.comment}>{comment}</sub>
        }

        {errorMessage &&
          <p class={styles['error-message']}>{errorMessage}</p>
        }
      </label>
    )
  }
}
