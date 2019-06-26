import {getUniqueId} from 'lib/util'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Label.css'

/**
 * A label to wrap any type of input field.
 */
export default class Label extends React.Component {
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
     * Whether the label, or a component inside it, has focus.
     */
    hasFocus: proptypes.bool,

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
    const {children, error, required} = this.props

    return React.Children.map(children, (child, index) => {
      if (!child || typeof child.type === 'string') {
        return child
      }

      const childProps = {
        inLabel: true
      }

      if (error) {
        childProps.error = true
      }

      if (index === 0) {
        childProps.id = this.id
      }

      if (required) {
        childProps.required = true
      }

      return React.cloneElement(child, childProps)
    })
  }

  render() {
    const {
      className,
      comment,
      compact,
      label,
      error,
      errorMessage,
      hasFocus
    } = this.props
    const labelStyle = new Style(styles, 'container')
      .addIf('container-compact', compact)
      .addIf('container-error', error)
      .addIf('container-error-message', errorMessage)
      .addIf('container-focus', hasFocus)
      .addIf('container-with-comment', comment)
      .addResolved(className)

    if (
      (label && typeof label !== 'string') ||
      (comment && typeof comment !== 'string') ||
      (errorMessage && typeof errorMessage !== 'string')
    ) {
      return null
    }

    return (
      <label htmlFor={this.id} className={labelStyle.getClasses()}>
        {(label || comment) && (
          <div className={styles.header}>
            <div className={styles.label}>{label || ''}</div>
            {comment && <div className={styles.comment}>{comment}</div>}
          </div>
        )}
        <div>{this.renderChildren()}</div>
        {errorMessage && (
          <p className={styles['error-message']}>{errorMessage}</p>
        )}
      </label>
    )
  }
}
