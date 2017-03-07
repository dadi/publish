'use strict'

import {h, Component} from 'preact'

import TextInput from 'components/TextInput/TextInput'
import Button from 'components/Button/Button'

export default class DocumentFilter extends Component {

  static defaultProps = {
    callback: null
  }

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
    this.state = {
      field: null,
      type: '$eq',
      value: null
    }
  }

  componentWillMount() {
    const {field, value, fields} = this.props

    // Evaluate passed filter / store in state
    if (field && value) {
      this.setState({
        field: field,
        type: (typeof value === 'string') ? '$eq' : Object.keys(value)[0],
        value: this.filterValue(value)
      })
    }
  }

  render() {
    const {fields, value} = this.props

    return (
      <div>
        <select onChange={this.onChange.bind(this, 'field')}>
          <option disabled selected value>Select field</option>
          {Object.keys(fields).map(key => (
            <option selected={this.state.field === key} key={key} value={key}>{fields[key].label}</option>
          ))}
        </select>
        <select onChange={this.onChange.bind(this, 'type')}>
          <option disabled selected value>Select a type</option>
          {Object.keys(this.filterTypes).map(key => (
            <option selected={this.state.type === key} key={key} value={key}>{this.filterTypes[key]}</option>
          ))}
        </select>
        {this.state.field && this.state.type && (
          <TextInput 
            value={this.state.value} 
            onChange={this.onChange.bind(this, 'value')}
          />
        )}
        <Button>-</Button>
      </div>
    )
  }

  onChange(elementId, event) {
    const {updateFilter} = this.props

    this.setState({[elementId]: event.target.value})
    // {!} TO-DO add further evaluation in `Object.js`
    let nullProps = Object.keys(this.state).filter(key => {
      return Object.is(this.state[key], null)
    })

    if (!nullProps.length && typeof updateFilter === 'function') {
      updateFilter({[this.state.field]: {[this.state.type]: this.state.value}})
    }
  }

  filterValue (value) {
    if (typeof value === 'string') {
      return value
    } else {
      return value[Object.keys(value)[0]] || 'Empty'
    }
  }
}