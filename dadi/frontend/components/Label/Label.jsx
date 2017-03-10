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
     * The text to be rendered on the top-right corner of the label
     */
    comment: proptypes.string,

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
    label: proptypes.string,

    /**
     * The input element to be rendered inside the label.
     */
    children: proptypes.node
  }

  static defaultProps = {
    error: false,
    errorMessage: null,
    optional: false,
    required: false
  }

  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.id = getUniqueId()
  }

  // This will render all children and inject an `id` prop
  // with the generated unique id
  renderChildren() {
    const {children, error, required} = this.props

    return children.map(child => {
      child.attributes = child.attributes || {}
      child.attributes.id = child.attributes.id || this.id

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

      return child
    })
  }  

  render() {
    const {comment, error, errorMessage} = this.props

    let labelStyle = new Style(styles, 'container')

    labelStyle.addIf('container-error', error)
    labelStyle.addIf('container-error-message', errorMessage)

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

        {errorMessage &&
          <p class={styles['error-message']}>{errorMessage}</p>
        }

        {this.renderChildren()}
      </div>
    )
  }
}
