'use strict'

import * as fieldComponents from 'lib/field-components'
import {h, Component} from 'preact'
import {getFieldType} from 'lib/fields'
import {Keyboard} from 'lib/keyboard'
import Button from 'components/Button/Button'
import DocumentFilter from 'components/DocumentFilter/DocumentFilter'
import proptypes from 'proptypes'
import Style from 'lib/Style'
import styles from './DocumentFilters.css'
import TextInput from 'components/TextInput/TextInput'

const OPERATORS = {
  '$eq': 'equals',
  '$regex': 'contains'
}

/**
 * A list of document filters.
 */
export default class DocumentFilters extends Component {
  static propTypes = {}

  constructor(props) {
    super(props)

    this.state.search = null
    this.state.selectedFilterField = null
    this.state.selectedFilterIndex = null
    this.state.selectedFilterOperator = null
    this.state.selectedFilterValue = null

    this.outsideTooltipHandler = this.handleClick.bind(this, false)    
  }

  componentDidMount() {
    window.addEventListener('click', this.outsideTooltipHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.outsideTooltipHandler) 
  }

  buildFiltersArray(filtersObject) {
    if (!filtersObject) return []

    let filtersArray = Object.keys(filtersObject).map(field => {
      let operator = Object.keys(filtersObject[field])[0]
      let value = filtersObject[field][operator]

      return {
        field,
        operator,
        operatorFriendly: OPERATORS[operator],
        value
      }
    })

    return filtersArray
  }

  clearSearch() {
    this.setState({
      search: null,
      selectedFilterField: null,
      selectedFilterIndex: null,
      selectedFilterOperator: null,
      selectedFilterValue: null
    })
  }

  getFieldName(field) {
    const {collection} = this.props
    const fieldSchema = collection.fields[field]

    return fieldSchema.label || field
  }

  handleClick(isInsideTooltip, event) {
    event.stopPropagation()

    if (!isInsideTooltip) {
      this.setState({
        selectedFilterField: null,
        selectedFilterIndex: null,
        selectedFilterOperator: null,
        selectedFilterValue: null
      })
    }
  }

  handleFilterSelect(index, event) {
    const {field, operator, value} = this.filtersArray[index]

    event.stopPropagation()

    this.setState({
      selectedFilterField: field,
      selectedFilterIndex: index,
      selectedFilterOperator: operator,
      selectedFilterValue: value
    })
  }

  handleFilterSubmit(field, event) {
    const {collection, filters} = this.props
    const {search: searchValue} = this.state

    this.filtersArray.push({
      field,
      operator: '$regex',
      value: searchValue
    })

    this.propagateFilters()
    this.clearSearch()

    event.preventDefault()
  }

  propagateFilters() {
    const {onUpdateFilters} = this.props

    let newFiltersObject = this.filtersArray.reduce((result, filter) => {
      const {field, operator, value} = filter

      result[field] = operator === '$eq' ?
        value :
        {[operator]: value}

      return result
    }, {})

    onUpdateFilters(newFiltersObject)
  }

  removeFilter(index, event) {
    const {
      onUpdateFilters
    } = this.props

    let newFilters = this.filtersArray.reduce((result, filter, arrayIndex) => {
      if (index !== arrayIndex) {
        const {field, operator, value} = filter

        result[field] = {
          [operator]: value
        }
      }

      return result
    }, {})

    onUpdateFilters(newFilters)

    event.stopPropagation()
  }

  render() {
    const {
      collection,
      filters,
    } = this.props
    const {search: searchValue} = this.state

    if (!collection) return null

    this.filtersArray = this.buildFiltersArray(filters)

    // Finding String fields that don't already have filters applied.
    let searchableFields = Object.keys(collection.fields).filter(field => {
      if (collection.fields[field].type.toLowerCase() !== 'string') {
        return false
      }

      return !filters || filters[field] === undefined
    })

    return (
      <div class={styles.wrapper}>
        <form
          class={styles.form}
          onSubmit={this.handleFilterSubmit.bind(this, searchableFields[0])}
        >
          <TextInput
            className={styles.input}
            onInput={event => this.setState({
              search: event.target.value
            })}
            placeholder={`Search ${collection.name}`}
            value={searchValue}
          />

          {searchValue &&
            <div class={styles.suggestions}>
              {searchableFields.map(fieldName => (
                <button
                  class={styles.suggestion}
                  onClick={this.handleFilterSubmit.bind(this, fieldName)}
                  type="button"
                >
                  <span class={styles['suggestion-prefix']}>
                    {this.getFieldName(fieldName)} contains
                  </span>
                  '{searchValue}'
                </button>
              ))}
            </div>
          }          
        </form>

        <div class={styles.filters}>
          {this.filtersArray.map(this.renderFilter.bind(this))}
        </div>
      </div>
    )
  }

  renderFilter(filter, index) {
    const {
      field,
      operator,
      operatorFriendly,
      value
    } = filter
    const {collection} = this.props
    const {
      selectedFilterIndex
    } = this.state

    return (
      <div class={styles['filter-wrapper']}>
        <div
          class={styles.filter}
          onClick={this.handleFilterSelect.bind(this, index)}
        >
          <span class={styles['filter-node']}>{this.getFieldName(field)}</span>
          <span class={styles['filter-node']}>{operatorFriendly || operator}</span>
          <span class={styles['filter-node']}>'{value}'</span>

          <button
            class={styles['filter-close']}
            onClick={this.removeFilter.bind(this, index)}
          >x</button>
        </div>

        {selectedFilterIndex === index && this.renderFilterTooltip(index)}
      </div>
    )
  }

  renderFilterTooltip(index) {
    const {collection} = this.props
    const {
      selectedFilterField: field,
      selectedFilterOperator: operator,
      selectedFilterValue: value
    } = this.state
    const fieldSchema = field && collection.fields[field]

    if (!fieldSchema) return null

    const fieldType = getFieldType(fieldSchema)
    const {
      filter: FilterComponent,
      operators
    } = fieldComponents[`Field${fieldType}`] || {}

    return (
      <div
        class={styles.tooltip}
        onClick={this.handleClick.bind(this, true)}
      >
        <select
          onChange={event => this.setState({
            selectedFilterField: event.target.value
          })}
          value={field}
        >
          {Object.keys(collection.fields).map(name => (
            <option value={name}>{name}</option>
          ))}
        </select>

        {operators &&
          <select
            onChange={event => this.setState({
              selectedFilterOperator: event.target.value
            })}
            value={operator}
          >
            {Object.keys(operators).map(operator => (
              <option value={operator}>{operators[operator]}</option>
            ))}
          </select>
        }

        {FilterComponent &&
          <FilterComponent
            onUpdate={value => this.setState({
              selectedFilterValue: value
            })}
            value={value}
          />
        }

        <Button
          accent="data"
          onClick={() => this.updateFilter(index, {
            field,
            operator,
            value
          })}
        >Update filter</Button>
      </div>
    ) 
  }

  updateFilter(index, {
    field,
    operator,
    value
  }) {
    this.filtersArray[index].field = field
    this.filtersArray[index].operator = operator
    this.filtersArray[index].value = value

    this.setState({
      selectedFilterField: null
    })

    this.propagateFilters()
  }
}
