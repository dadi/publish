'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentFilters.css'

import {isValidJSON, objectToArray, arrayToObject} from 'lib/util'

import DocumentFilter from 'components/DocumentFilter/DocumentFilter'
import Button from 'components/Button/Button'

/**
 * A list of document filters.
 */
export default class DocumentFilters extends Component {
  static propTypes = {
    /**
     * The schema of the collection being filtered.
     */
    collection: proptypes.object,

    /**
     * The JSON-stringified object of filters currently applied.
     */
    filter: proptypes.string
  }

  constructor(props) {
    super(props)

    const {filter} = props

    // Evaluate passed filter / store in state
    const filters = (isValidJSON(filter) ? objectToArray(JSON.parse(filter), 'field') : []).map(this.deconstructFilters)

    // The list of applied filters
    this.state = {
      filters: filters
    }
  }

  render() {
    const {filters} = this.state
    const {collection} = this.props

    return (
      <form class={styles.filters}>
        {filters && collection && filters.map((filter, index) => (
          <DocumentFilter
            index={index}
            field={filter.field}
            type={filter.type}
            value={filter.value}
            fields={collection.fields}
            onUpdate={this.updateFilter.bind(this)}
            onRemove={this.removeFilter.bind(this)}
          />
        ))}

        <div class={styles.controls}>
          <Button
            className={styles['add-button']}
            onClick={this.addFilter.bind(this)}
          >
            +
          </Button>
        </div>
      </form>
    )
  }

  deconstructFilters(filter) {
    // If there is no filter type and the field value is a string, add a type
    if (typeof filter.value === 'string') {
      return Object.assign(filter, {type: '$eq'})
    } else {
      const type = Object.keys(filter.value)[0]

      return Object.assign(filter, {type: type, value: filter.value[type]})
    }
  }

  constructFilters(filters) {
    return filters.map(filter => {
      return Object.assign({}, filter, {value: {[filter.type]: filter.value}})
    })
  }

  removeFilter(index) {
    const {filters} = this.state
    const newFilters = [...filters]

    newFilters.splice(index, 1)

    this.setState({filters: newFilters})
    this.updateUrl()
  }

  updateFilter(filterProp, index) {
    const {filters} = this.state
    const filter = Object.assign({}, filters[index], filterProp)
    const newFilters = [...filters]

    Object.assign(newFilters[index], filter)
    this.setState({filters: newFilters})

    this.updateUrl()
  }

  updateUrl() {
    // Remove filters with null values
    const {filters} = this.state
    const {updateUrlParams} = this.props

    let validFilters = filters.filter(entry => {
      let isValid = Object.keys(entry).filter(key => {
        return Object.is(entry[key], null)
      })

      return isValid.length < 1
    })
    const constructedFilters = this.constructFilters(validFilters)
    const filterObj = arrayToObject(constructedFilters, 'field')

    if (filterObj) {
      updateUrlParams(filterObj)
    }
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
