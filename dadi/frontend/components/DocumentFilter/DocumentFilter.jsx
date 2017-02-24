'use strict'

import { h, Component } from 'preact'

import TextInput from 'components/TextInput/TextInput'

export default class DocumentFilter extends Component {

  constructor(props) {
    super(props)

    // Move to filter
    this.filterTypes = {
      '$eq': 'Equals',
      '$ne': 'Not Equal to',
      '$nin': 'Not in',
      '$in': 'In',
      '$gt': 'Greater than',
      '$gte': 'Greater than or Equal to',
      '$lt': 'Less than',
      '$lte': 'Less than or Equal to'
    }
  }

  render() {
    const { field, value, fields } = this.props
    return (
      <div>
        <select>
          {Object.keys(fields).map(key => (
            <option selected={field === key} name={key}>{fields[key].label}</option>
          ))}
        </select>
        <select>
          {Object.keys(this.filterTypes).map(key => (
            <option name={key}>{this.filterTypes[key]}</option>
          ))}
        </select>
        {field && value && (
          <TextInput value={this.filterValue(value)} />
        )}
      </div>
    )
  }

  filterValue (value) {
    if (typeof value === 'string') {
      return value
    } else {
      return value[Object.keys(value)[0]] || 'Empty'
    }
  }
}