'use strict'

import * as fieldComponents from 'lib/field-components'
import {h, Component} from 'preact'
import {getFieldType} from 'lib/fields'
import {Keyboard} from 'lib/keyboard'
import Button from 'components/Button/Button'
import DocumentFilter from 'components/DocumentFilter/DocumentFilter'
import DropdownNative from 'components/DropdownNative/DropdownNative'
import proptypes from 'proptypes'
import Style from 'lib/Style'
import styles from './DocumentFilters.css'
import TextInput from 'components/TextInput/TextInput'

const DEFAULT_OPERATOR_KEYWORD = '$eq'
const DEFAULT_OPERATOR_NAME = 'is'

const OPERATORS = {
  '$eq': 'is',
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
      const fieldComponent = this.getFieldComponent(field) || {}
      const {
        operators: fieldOperators = {}
      } = fieldComponent
      let operator = null
      let value = filtersObject[field]

      // Are we looking at a filter with an operator? (i.e.
      // {"field": {"operator": "value"}} vs. {"field": "value"}).
      if (typeof value === 'object') {
        operator = Object.keys(value)[0]
        value = value[operator]
      }

      return {
        field,
        operator,
        operatorFriendly: fieldOperators[operator] || DEFAULT_OPERATOR_NAME,
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

  getFieldComponent(fieldName) {
    const {collection} = this.props
    const fieldSchema = fieldName && collection.fields[fieldName]

    if (!fieldSchema) return null

    const fieldType = getFieldType(fieldSchema)

    return fieldComponents[`Field${fieldType}`]
  }

  getFieldName(fieldName) {
    const {collection} = this.props
    const fieldSchema = collection.fields[fieldName]

    return fieldSchema.label || fieldName
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

  handleFiltersButtonClick(event) {
    const {
      selectedFilterIndex
    } = this.state

    event.stopPropagation()

    // If the "Add filter" popup is already visible, clicking on the filters
    // button should hide the popup. Otherwise, it should show it.
    let newIndex = selectedFilterIndex === -1 ? null : -1

    this.setState({
      selectedFilterField: null,
      selectedFilterIndex: newIndex,
      selectedFilterOperator: null,
      selectedFilterValue: null
    })
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

  handleSelectedFilterFieldChange(newField) {
    const {
      selectedFilterOperator
    } = this.state    
    const fieldComponent = this.getFieldComponent(newField) || {}
    const fieldOperators = fieldComponent.operators || {}
    
    // If the new selected field supports the currently selected operator, we
    // keep it. Otherwise, we use the first operator defined by the new field
    // component.
    const newOperator = fieldOperators[selectedFilterOperator] ?
      selectedFilterOperator :
      Object.keys(fieldOperators)[0]

    this.setState({
      selectedFilterField: newField,
      selectedFilterOperator: newOperator
    })
  }

  handleSelectedFilterUpdate(field, event) {
    const {
      selectedFilterIndex: index,
      selectedFilterOperator: operator,
      selectedFilterValue: value
    } = this.state

    event.preventDefault()

    if (typeof index !== 'number') {
      return
    }

    // Are we updating an existing filter or creating a new one?
    if (index === -1) {
      this.filtersArray.push({
        field,
        operator,
        value
      })
    } else {
      if (!this.filtersArray[index]) {
        return
      }

      this.filtersArray[index].field = field
      this.filtersArray[index].operator = operator
      this.filtersArray[index].value = value
    }

    this.setState({
      selectedFilterIndex: null
    })

    this.propagateFilters()
  }

  propagateFilters() {
    const {onUpdateFilters} = this.props

    let newFiltersObject = this.filtersArray.reduce((result, filter) => {
      const {field, operator, value} = filter

      result[field] = (!operator || operator === DEFAULT_OPERATOR_KEYWORD) ?
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
    const {
      search: searchValue,
      selectedFilterField,
      selectedFilterIndex,
      selectedFilterOperator,
      selectedFilterValue
    } = this.state

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

        <button
          class={styles.button}
          onClick={this.handleFiltersButtonClick.bind(this)}
          type="button"
        >Add filter</button>

        {selectedFilterIndex === -1 &&
          <div class={styles['new-filter-tooltip']}>
            {this.renderFilterTooltip({
              field: selectedFilterField,
              operator: selectedFilterOperator,
              value: selectedFilterValue
            })}
          </div>
        }

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
      selectedFilterField,
      selectedFilterIndex,
      selectedFilterOperator,
      selectedFilterValue
    } = this.state

    return (
      <div class={styles['filter-wrapper']}>
        <div
          class={styles.filter}
          onClick={this.handleFilterSelect.bind(this, index)}
        >
          <span class={styles['filter-node']}>{this.getFieldName(field)}</span>
          <span class={styles['filter-node']}>{operatorFriendly || operator || DEFAULT_OPERATOR_NAME}</span>
          <span class={styles['filter-node']}>'{value.toString()}'</span>

          <button
            class={styles['filter-close']}
            onClick={this.removeFilter.bind(this, index)}
          >x</button>
        </div>

        {selectedFilterIndex === index && this.renderFilterTooltip({
          field: selectedFilterField,
          isUpdate: true,
          operator: selectedFilterOperator,
          value: selectedFilterValue
        })}
      </div>
    )
  }

  renderFilterTooltip({
    field,
    isUpdate,
    operator,
    value
  } = {}) {
    const {collection, filters} = this.props

    // Finding fields that are filterable (i.e. their component exports a
    // `filter` component) and don't already have a filter applied. The
    // result is an object mapping filterable field slugs to their human-
    // friendly name.
    let filterableFields = Object.keys(collection.fields).reduce((result, slug) => {
      let fieldComponent = this.getFieldComponent(slug)

      if (
        fieldComponent.filter &&
        (field === slug || !filters || filters[slug] === undefined)
      ) {
        result[slug] = this.getFieldName(slug)  
      }

      return result
    }, {})

    // Applying defaults.
    field = field || Object.keys(filterableFields)[0]

    const {
      filter: FilterComponent,
      operators
    } = this.getFieldComponent(field) || {}

    const tooltipStyle = new Style(styles, 'tooltip')
      .addIf('tooltip-right', !Boolean(isUpdate))
    const fieldSelectorStyle = new Style(styles)
      .addIf('tooltip-dropdown-left', Boolean(operators))

    return (
      <form
        class={tooltipStyle.getClasses()}
        onClick={this.handleClick.bind(this, true)}
        onSubmit={this.handleSelectedFilterUpdate.bind(this, field)}
      >
        <div class={styles['tooltip-section']}>
          <h3
            class={styles['tooltip-heading']}
          >Filtering</h3>

          <DropdownNative
            className={fieldSelectorStyle.getClasses()}
            onChange={this.handleSelectedFilterFieldChange.bind(this)}
            options={filterableFields}
            textSize="small"
            value={field || Object.keys(filterableFields)[0]}
          />

          {operators &&
            <DropdownNative
              className={styles['tooltip-dropdown-right']}
              onChange={value => this.setState({
                selectedFilterOperator: value
              })}
              options={Object.assign({
                [DEFAULT_OPERATOR_KEYWORD]: DEFAULT_OPERATOR_NAME
              }, operators)}
              textSize="small"
              value={operator || DEFAULT_OPERATOR_KEYWORD}
            />
          }
        </div>

        <div class={styles['tooltip-section']}>
          <h3
            class={styles['tooltip-heading']}
          >Value</h3>

          {FilterComponent &&
            <FilterComponent
              onUpdate={value => this.setState({
                selectedFilterValue: value
              })}
              stylesTextInput={styles['tooltip-input']}
              value={value}
            />
          }
        </div>

        <Button
          accent="data"
          className={styles['tooltip-cta']}
          type="submit"
        >{isUpdate ? 'Update' : 'Add'} filter</Button>
      </form>
    ) 
  }
}
