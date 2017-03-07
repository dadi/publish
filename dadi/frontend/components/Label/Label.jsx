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
     * When `true`, renders the text *Optional* on the top-right corner of the label.
     */
    optional: proptypes.bool,

    /**
     * When `true`, renders the text *Required* on the top-right corner of the label (takes precedence over *Optional*).
     */
    required: proptypes.bool,

    /**
     * The input element to be rendered inside the label.
     */
    children: proptypes.node
  }

  static defaultProps = {
    optional: false,
    required: false
  }

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
