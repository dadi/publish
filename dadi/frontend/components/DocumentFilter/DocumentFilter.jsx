'use strict'

import {h, Component} from 'preact'

import TextInput from 'components/TextInput/TextInput'
import Button from 'components/Button/Button'

export default class DocumentFilter extends Component {

  constructor(props) {
    super(props)

    // {!} To do - reduce by filter type
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
    const {field, fields, type, value} = this.props
    
    return (
      <form>
        <select onChange={this.onChange.bind(this, 'field')}>
          <option disabled selected value>Select field</option>
          {Object.keys(fields).map(key => (
            <option selected={field === key} key={key} value={key}>{fields[key].label}</option>
          ))}
        </select>
        <select onChange={this.onChange.bind(this, 'type')}>
          <option disabled selected value>Select a type</option>
          {Object.keys(this.filterTypes).map(key => (
            <option selected={type === key} key={key} value={key}>{this.filterTypes[key]}</option>
          ))}
        </select>
        {field && type && (
          <TextInput 
            value={value} 
            onChange={this.onChange.bind(this, 'value')}
          />
        )}
        <Button>-</Button>
      </form>
    )
  }

  onChange(elementId, event) {
    const {updateFilter, index} = this.props
    updateFilter({[elementId]: event.target.value}, index)
  }

  filterValue (value) {
    if (typeof value === 'string') {
      return value
    } else {
      return value[Object.keys(value)[0]] || ''
    }
  }
}