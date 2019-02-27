'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import DateTime from 'lib/datetime'
import styles from './FieldDateTime.css'
import TextInputWithDatePicker from 'components/TextInputWithDatePicker/TextInputWithDatePicker'

/**
 * Component for rendering API fields of type DateTime in a filter.
 */
export default class FieldDateTimeFilter extends Component {
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

  handleChange(elementId, data) {
    const {config = {}, onUpdate, index} = this.props

    let newValue = new DateTime(data, config.formats.date.short)

    if (data.length > 0 && newValue.isValid()) {
      newValue = newValue.getDate().toISOString()
    }

    onUpdate(newValue)
  }

  render() {
    const {
      config = {},
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
        onChange={this.handleChange.bind(this, 'value')}
        onKeyUp={this.handleChange.bind(this, 'value')}
        placeholder="Search value"
        type="date"
        value={value}
      />
    )
  }
}
