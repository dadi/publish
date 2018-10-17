'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldBoolean.css'

/**
 * Component for rendering API fields of type Boolean on a list view.
 */
export default class FieldBooleanList extends Component {
  static propTypes = {
    /**
     * The field value.
     */
    value: proptypes.bool,

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  render() {
    const {value} = this.props

    return value ? (
      <span class={styles.enabled}>Yes</span>
    ) : (
      <span class={styles.disabled}>No</span>
    )
  }
}
