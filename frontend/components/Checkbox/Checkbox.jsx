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
     * The value of the checkbox, determining whether it's checked or not.
     */
    value: proptypes.bool
  }

  render() {
    const {
      id,
      onChange,
      value
    } = this.props

    return (
      <input
        checked={value}
        class={styles.checkbox}
        id={id}
        onChange={onChange}
        type="checkbox"
      />
    )
  }
}
