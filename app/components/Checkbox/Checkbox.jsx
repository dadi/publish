import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './Checkbox.css'

/**
 * A checkbox input element.
 */
export default class Checkbox extends React.Component {
  static propTypes = {
    /**
     * The ID of the input element.
     */
    id: proptypes.string,

    /**
     * The name of the input element.
     */
    name: proptypes.string,

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
      name,
      onChange,
      readonly,
      value
    } = this.props

    return (
      <input
        checked={value}
        className={styles.checkbox}
        disabled={readonly}
        id={id}
        name={name}
        onChange={onChange}
        type="checkbox"
      />
    )
  }
}
