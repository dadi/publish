'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Checkbox.css'

/**
 * A checkbox input element.
 */
export default class Checkbox extends Component {
  static propTypes = {
    /**
     * The ID of the input element.
     */
    id: proptypes.string,

    /**
     * A callback function to be fired whenever the value changes.
     */
    onChange: proptypes.func,

    /**
     * Whether the field is required.
     *
     * **NOTE:** This prop is automatically passed down by `<Label/>`.       
     */
    readonly: proptypes.bool,

    /**
     * The value of the checkbox, determining whether it's checked or not.
     */
    value: proptypes.bool
  }

  render() {
    const {
      id,
      onChange,
      readonly,
      value
    } = this.props

    return (
      <input
        checked={value}
        class={styles.checkbox}
        disabled={readonly}
        id={id}
        onChange={onChange}
        type="checkbox"
      />
    )
  }
}
