import proptypes from 'prop-types'
import React from 'react'
import styles from './FieldDateTime.css'
import TextInputWithDatePicker from 'components/TextInputWithDatePicker/TextInputWithDatePicker'

/**
 * Component for rendering API fields of type DateTime in a filter.
 */
export default class FieldDateTimeFilter extends React.Component {
  static propTypes = {
    /**
     * App config.
     */
    config: proptypes.object,

    /**
     * Input update callback.
     */
    onUpdate: proptypes.func,

    /**
     * Field value.
     */
    value: proptypes.object
  }

  render() {
    const {
      config = {},
      onUpdate,
      value
    } = this.props
    const formats = config.formats || {}
    const date = formats.date || {}
    const format = date.short

    return (
      <TextInputWithDatePicker
        containerClassName={styles['filter-container']}
        format={format}
        inputClassName={styles['filter-input']}
        onChange={onUpdate}
        onKeyUp={onUpdate}
        placeholder="Search value"
        value={value}
      />
    )
  }
}
