'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import TextInput from 'components/TextInput/TextInput'

/**
 * Component for rendering API fields of type String in a filter.
 */
export default class FieldStringFilter extends Component {
  static propTypes = {
   
  }

  constructor(props) {
    super(props)

    this.filterTypes = {
      '$eq': 'Equals',
      '$ne': 'Is not',
      '$regex': 'Contains'
    }
  }

  render() {
    const {
      analyserStyles,
      containerStyles,
      onTypeChange,
      onValueChange,
      handleValueChange,
      type,
      value,
      valueStyles
    } = this.props

    return (
        <div class={containerStyles}>
          <select
            class={analyserStyles}
            onChange={onTypeChange}
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
              className={valueStyles}
              value={value}
              onChange={onValueChange}
              onKeyUp={onValueChange}
              placeholder="Search value"
            />
        </div>
    )
  }
}
