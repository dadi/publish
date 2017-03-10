'use strict'

import {h, Component} from 'preact'

import {isValidJSON, objectToArray, arrayToObject} from 'lib/util'

import DocumentFilter from 'components/DocumentFilter/DocumentFilter'
import Button from 'components/Button/Button'

export default class DocumentFilters extends Component {

  componentWillMount() {
    const {
      filter, 
      collection, 
      field, 
      value, 
      fields
    } = this.props

    // Evaluate passed filter / store in state
    let filters = (isValidJSON(filter) ? objectToArray(JSON.parse(filter), 'field') : []).map(this.deconstructFilters)
    this.state = {
      visible: filter || false,
      filters: filters
    }
  }
  render() {
    const {visible, filters} = this.state
    const {collection} = this.props

    return (
      <div>
        <Button onClick={this.toggleFilters.bind(this)}>Filters</Button>
        {visible && filters && collection && (
          <div>
            {filters.map((filter, index) => ( 
              <DocumentFilter 
                index={index}
                field={filter.field} 
                type={filter.type} 
                value={filter.value} 
                fields={collection.fields} 
                updateFilter={this.updateUrlFilters.bind(this)} 
                />
            ))}
          </div>
        )}
        {visible && (
          <Button onClick={this.addFilter.bind(this)}>Add</Button>
        )}
      </div>
    )
  }

  deconstructFilters(filter) {
    // If there is no filter type and the field value is a string, add a type
    if (typeof filter.value === 'string') return Object.assign(filter, {type: '$eq'})
    else {
      let type = Object.keys(filter.value)[0]
      return Object.assign(filter, {type: type, value: filter.value[type]})
    }
  }

  constructFilters(filters) {
    return filters.map(filter => {
      return Object.assign({}, filter, {value: {[filter.type]: filter.value}})
    })
  }

  updateUrlFilters(filterProp, index) {
    const {updateUrlParams} = this.props
    const {filters} = this.state
    const filter = Object.assign({}, filters[index], filterProp)
    const newFilters = [...filters]

    Object.assign(newFilters[index], filter)
    this.setState({filters: newFilters})

    // Remove filters with null values
    let validFilters = this.state.filters.filter(entry => {
      let isValid = Object.keys(entry).filter(key => {
        return Object.is(entry[key], null)
      })
      return isValid.length < 1
    })
    let constructedFilters = this.constructFilters(validFilters)
    let filterObj = arrayToObject(constructedFilters, 'field')
    if (filterObj) {
      updateUrlParams(filterObj)
    }
  }

  toggleFilters() {
    this.setState({
      visible: !this.state.visible
    })
  }

  addFilter() {
    const {filters} = this.state

    // Add blank filter
    this.setState({
      filters: [...filters, {
        field: null,
        value: null,
        type: '$eq'
      }]
    })
  }
}