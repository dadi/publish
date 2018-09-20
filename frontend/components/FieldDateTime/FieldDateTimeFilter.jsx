'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import DateTime from 'lib/datetime'

import Style from 'lib/Style'
import styles from './FieldDateTime.css'

import TextInput from 'components/TextInput/TextInput'
import TextInputWithDatePicker from 'components/TextInputWithDatePicker/TextInputWithDatePicker'

/**
 * Component for rendering API fields of type DateTime in a filter.
 */
export default class FieldDateTimeFilter extends Component {
  static propTypes = {
    /**
     * Classes for the analyser selection.
     */
    analyserStyles: proptypes.string,

    /**
     * App config.
     */
    config: proptypes.object,

    /**
     * Classes for the container.
     */
    containerStyles: proptypes.string,

    /**
     * Filter array position.
     */
    index: proptypes.number,

    /**
     * Input update callback.
     */
    onUpdate: proptypes.func,

    /**
     * Field type.
     */
    type: proptypes.string,

    /**
     * Field value.
     */
    value: proptypes.string,

    /**
     * Classes for the value input.
     */
    valueStyles: proptypes.string
  }

  constructor(props) {
    super(props)

    this.filterTypes = {
      '$gt': 'After',
      '$lt': 'Before'
      // TO-DO: Add more filter.
    }
  }

  render() {
    let {
      analyserStyles,
      config,
      containerStyles,
      type,
      value,
      valueStyles
    } = this.props

    config = config || {}
    const formats = config.formats || {}
    const date = formats.date || {}
    const format = date.short

    return (
      <div class={containerStyles}>
        <select
          class={analyserStyles}
          onChange={this.handleChange.bind(this, 'type')}
        >
          <option disabled selected value>Select a type</option>
          {Object.keys(this.filterTypes).map(key => (
            <option
              selected={type === key}
              key={key}
              value={key}
            >
              {this.filterTypes[key]}
            </option>
          ))}
        </select>
        <TextInputWithDatePicker
          className={valueStyles}
          format={format}
          onChange={this.handleChange.bind(this, 'value')}
          onKeyUp={this.handleChange.bind(this, 'value')}
          placeholder="Search value"
          type="date"
          value={value}
        />
      </div>
    )
  }

  handleChange(elementId, data) {
    const {config, onUpdate, index} = this.props

    let newValue = null

    if (elementId === 'value') {
      const newDate = new DateTime(data, config.formats.date.short)

      if (data.length > 0 && newDate.isValid()) {
        newValue = newDate.getDate().toISOString()
      }
    } else {
      newValue = data.target.value
    }

    onUpdate({
      [elementId]: newValue
    }, index)
  }
}
