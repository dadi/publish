'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import DateTime from 'lib/datetime'

import Style from 'lib/Style'
import styles from './FieldDateTime.css'

import DateTimePicker from 'components/DateTimePicker/DateTimePicker'
import TextInput from 'components/TextInput/TextInput'

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
    const {
      analyserStyles,
      containerStyles,
      type,
      value,
      valueStyles
    } = this.props

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
            <TextInput
              type="date"
              className={valueStyles}
              value={value}
              onChange={this.handleChange.bind(this, 'value')}
              onKeyUp={this.handleChange.bind(this, 'value')}
              placeholder="Search value"
            />
        </div>
    )
  }

  handleChange(elementId, event) {
    const {config, onUpdate, index} = this.props
    const newDate = new DateTime(event.target.value, config.formats.date.long)
    let newValue = null

    if (event.target.value.length > 0 && newDate.isValid()) {
      newValue = newDate.getDate().toISOString()
    }

    onUpdate({
      [elementId]: newValue
    }, index)
  }
}
