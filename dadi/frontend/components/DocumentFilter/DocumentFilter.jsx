'use strict'

import { h, Component } from 'preact'

export default class DocumentFilter extends Component {

  constructor (props) {
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
    const { key, value } = this.props
    
    return (
      <div>
        <h3>Field: {key}</h3>
        <p>{this.filterType(value)} {this.filterValue(value)}</p>
      </div>
    )
  }

  filterType (value) {
    if (typeof value === 'string') {
      return 'Equals'
    } else {
      return this.filterTypes[Object.keys(value)[0]]
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