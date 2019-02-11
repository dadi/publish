'use strict'

import * as fieldComponents from 'lib/field-components'
import {h, Component} from 'preact'
import {getFieldType} from 'lib/fields'
import {Keyboard} from 'lib/keyboard'
import Button from 'components/Button/Button'
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
  static propTypes = {
    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The set of filters currently being applied.
     */
    filters: proptypes.object,

    /**
     * The callback to execute when the filters are updated.
     */
    onFiltersUpdate: proptypes.func
  }

  constructor(props) {
    super(props)

    this.defaultState = {
      search: null,
      selectedFilterField: null,
      selectedFilterIndex: null,
      selectedFilterOperator: null,
      selectedFilterValue: null,
      searchableFieldsPointer: 0
    }

    this.state = {...this.defaultState}

    this.outsideTooltipHandler = this.handleClick.bind(this, false)    
  }

  componentDidMount() {
    window.addEventListener('click', this.outsideTooltipHandler)
  }

  componentDidUpdate(oldProps) {
    const {collection = {}} = this.props
    const {collection: oldCollection = {}} = oldProps

    // If we have navigated to a different collection, we should reset the
    // state o the search bar.
    if (collection.path !== oldCollection.path) {
      this.setState({...this.defaultState})
    }
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
    const {search: searchValue} = this.state

    event.preventDefault()

    if (searchValue) {
      this.filtersArray.push({
        field,
        operator: '$regex',
        value: searchValue
      })

      this.propagateFilters()
      this.setState({...this.defaultState})
    }
  }

  handleSearchableFieldsPointer(fields, event) {
    const {searchableFieldsPointer} = this.state

    if (event.keyCode === 38 && searchableFieldsPointer > 0) {
      // Up.
      this.setState(({searchableFieldsPointer}) => ({
        searchableFieldsPointer: searchableFieldsPointer - 1
      }))
    } else if (event.keyCode === 40 && searchableFieldsPointer < fields.length - 1) {
      // Down.
      this.setState(({searchableFieldsPointer}) => ({
        searchableFieldsPointer: searchableFieldsPointer + 1
      }))
    } else if ((event.keyCode === 27 || event.keyCode === 8) && !this.state.search) {
      // ESC or backspace and no search term.
      this.removeFilter(this.filtersArray.length - 1, event)
    } else if (event.keyCode === 27) {
      // Just ESC.
      this.setState({...this.defaultState})
    }
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

  handleSelectedFilterUpdate(field, defaultOperator, event) {
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
        operator: operator || defaultOperator,
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
          onSubmit={this.handleFilterSubmit.bind(this, searchableFields[this.state.searchableFieldsPointer])}
        >
          <TextInput
            className={styles.input}
            onInput={event => this.setState({
              search: event.target.value
            })}
            onKeyDown={this.handleSearchableFieldsPointer.bind(this, searchableFields)}
            placeholder={`Search ${collection.name}`}
            value={searchValue}
            tabindex="1"
          />

          {searchValue &&
            <div class={styles.suggestions}>
              {searchableFields.map((fieldName, index) => {
                const suggestionStyle = new Style(styles, 'suggestion')
                  .addIf('suggestion-selected', this.state.searchableFieldsPointer === index)

                return (
                  <button
                    class={suggestionStyle.getClasses()}
                    onClick={this.handleFilterSubmit.bind(this, fieldName)}
                    type="button"
                  >
                    <span class={styles['suggestion-prefix']}>
                      {this.getFieldName(fieldName)} contains
                    </span>
                    ‘{searchValue}’
                  </button>
                )
              })}
            </div>
          }
        </form>

        <div class={styles.filters}>
          {this.filtersArray.map(this.renderFilter.bind(this))}
        </div>

        <Button 
          className={styles.button}
          accent="data"
          onClick={this.handleFiltersButtonClick.bind(this)}
          type="button"
        >Add filter</Button>

        {selectedFilterIndex === -1 &&
          <div class={styles['new-filter-tooltip']}>
            {this.renderFilterTooltip({
              field: selectedFilterField,
              operator: selectedFilterOperator,
              value: selectedFilterValue
            })}
          </div>
        }
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
          <span class={styles['filter-field']}>{this.getFieldName(field)}</span>
          <span class={styles['filter-operator']}>{operatorFriendly || operator || DEFAULT_OPERATOR_NAME}</span>
          <span class={styles['filter-value']}>‘{value.toString()}’</span>

          <button
            class={styles['filter-close']}
            onClick={this.removeFilter.bind(this, index)}
          >×</button>
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

    let {
      filter: FilterComponent,
      operators = {}
    } = this.getFieldComponent(field) || {}
    let valueIsEmpty = value === null || value === undefined || value === ''

    const tooltipStyle = new Style(styles, 'tooltip')
      .addIf('tooltip-right', !Boolean(isUpdate))
    const fieldSelectorStyle = new Style(styles)
      .addIf('tooltip-dropdown-left', Boolean(operators))
    const selectedOperator = operator ||
      Object.keys(operators)[0] ||
      DEFAULT_OPERATOR_KEYWORD

    return (
      <form
        class={tooltipStyle.getClasses()}
        onClick={this.handleClick.bind(this, true)}
        onSubmit={this.handleSelectedFilterUpdate.bind(this, field, selectedOperator)}
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
              value={selectedOperator}
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
          disabled={valueIsEmpty}
          type="submit"
        >{isUpdate ? 'Update' : 'Add'} filter</Button>
      </form>
    ) 
  }
}
