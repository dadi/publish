import * as fieldComponents from 'lib/field-components'
import {Button, Select, TextInput} from '@dadi/edit-ui'
import {Close, FilterList, KeyboardReturn, Search} from '@material-ui/icons'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import {getFieldType} from 'lib/fields'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './DocumentListController.css'

const DEFAULT_OPERATOR_KEYWORD = '$eq'
const DEFAULT_OPERATOR_NAME = 'is'

// http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

/**
 * A list of document filters.
 */
class DocumentListController extends React.Component {
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
    onUpdateFilters: proptypes.func
  }

  constructor(props) {
    super(props)

    this.searchInputRef = React.createRef()

    this.selectField = this.selectField.bind(this)
    this.selectOperator = event =>
      this.setState({selectedFilterOperator: event.target.value})
    this.setFilterValue = value => this.setState({selectedFilterValue: value})

    this.openNewFilterEditor = () => this.setState({selectedFilterIndex: -1})

    this.closeFilterEditor = () =>
      this.setState({
        ...this.defaultState,
        areFiltersOpen: this.props.isSmallWindow && this.filtersArray.length > 0
      })

    this.clearFilters = () => {
      this.filtersArray = []
      this.propagateFilters()
      this.setState({...this.defaultState})
    }

    // For small-window version only.
    this.toggleSearch = () =>
      this.setState(({isSearchOpen}) =>
        isSearchOpen
          ? {...this.defaultState}
          : {...this.defaultState, isSearchOpen: true}
      )

    // For small-window version only.
    this.toggleFilters = () =>
      this.setState(({areFiltersOpen}) =>
        areFiltersOpen
          ? {...this.defaultState}
          : {
              ...this.defaultState,
              areFiltersOpen: true,
              // If there are no filters, open filter editor right away.
              selectedFilterIndex: this.filtersArray.length ? null : -1
            }
      )

    this.defaultState = {
      areFiltersOpen: false,
      isSearchOpen: false,
      search: null,
      selectedFilterField: null,
      selectedFilterIndex: null,
      selectedFilterOperator: null,
      selectedFilterValue: null,
      selectedSuggestionIndex: 0
    }
    this.state = {...this.defaultState}
  }

  addOrUpdateFilter(field, defaultOperator, event) {
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

    this.setState({...this.defaultState})
    this.propagateFilters()
  }

  buildFiltersArray(filtersObject = {}) {
    return Object.keys(filtersObject).map(field => {
      if (field === '$selected') {
        return {
          FilterList: () => this.renderSelectedFilter(filtersObject[field])
        }
      }

      const fieldComponent = this.getFieldComponent(field) || {}
      const {
        filterList: FilterList,
        filterOperators: fieldOperators = {}
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
        FilterList,
        operator,
        operatorFriendly: fieldOperators[operator] || DEFAULT_OPERATOR_NAME,
        value
      }
    })
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

    if (!fieldSchema) return null

    return fieldSchema.label || fieldName
  }

  getFilterableFields() {
    const {collection} = this.props

    // Finding fields that are filterable (i.e. their component exports a
    // `filter` component)
    const filterableFields = Object.keys(collection.fields).filter(slug => {
      const fieldComponent = this.getFieldComponent(slug)

      return fieldComponent && fieldComponent.filterEdit
    })

    return filterableFields
  }

  handleSearchKeydown(fields, event) {
    const {selectedSuggestionIndex} = this.state

    if (event.key === 'ArrowUp' && selectedSuggestionIndex > 0) {
      this.setState(({selectedSuggestionIndex}) => ({
        selectedSuggestionIndex: selectedSuggestionIndex - 1
      }))
    } else if (
      event.key === 'ArrowDown' &&
      selectedSuggestionIndex < fields.length - 1
    ) {
      this.setState(({selectedSuggestionIndex}) => ({
        selectedSuggestionIndex: selectedSuggestionIndex + 1
      }))
    } else if (event.key === 'Escape') {
      this.setState({...this.defaultState})
    }
  }

  propagateFilters() {
    const {onUpdateFilters} = this.props
    const newFiltersObject = this.filtersArray.reduce((result, filter) => {
      const {field, operator, value} = filter

      result[field] =
        !operator || operator === DEFAULT_OPERATOR_KEYWORD
          ? value
          : {[operator]: value}

      return result
    }, {})

    onUpdateFilters(newFiltersObject)
  }

  removeFilter(index, event) {
    event.stopPropagation()

    const newFilters = this.filtersArray.reduce(
      (result, filter, arrayIndex) => {
        if (index !== arrayIndex) {
          const {field, operator, value} = filter

          result[field] = operator
            ? {
                [operator]: value
              }
            : value
        }

        return result
      },
      {}
    )

    this.setState({...this.defaultState})
    this.props.onUpdateFilters(newFilters)
  }

  render() {
    const {
      collection,
      createNewHref,
      filters,
      isSmallWindow,
      route
    } = this.props
    const {isSearchOpen, areFiltersOpen, selectedFilterIndex} = this.state

    if (!collection) return null

    this.filtersArray = this.buildFiltersArray(filters)

    // Rather than having the breakpoint specified *both* in JS and in CSS media queries,
    // let's use this `small-window` class in place of the CSS media query.
    const containerStyle = new Style(styles, 'container')
      .addIf('small-window', isSmallWindow)
      .addIf('drawer-open', isSmallWindow && (isSearchOpen || areFiltersOpen))
      .addIf('search-open', isSmallWindow && isSearchOpen)
      .addIf('filters-open', isSmallWindow && areFiltersOpen)

    const addFilterButton = (
      <Button
        accent="positive"
        className={styles['add-filter-button']}
        data-name="add-filter-button"
        disabled={this.getFilterableFields().length === 0}
        onClick={this.openNewFilterEditor}
      >
        Add filter
      </Button>
    )

    const clearFiltersButton = this.filtersArray.length > 0 && (
      <Button
        accent="negative"
        className={styles['clear-filters-button']}
        data-name="clear-filters-button"
        onClick={this.clearFilters}
      >
        Clear filters
      </Button>
    )

    const createNewButton = createNewHref && (
      <Button
        accent="positive"
        className={styles['create-new-button']}
        data-name="create-new-button"
        fillStyle="filled"
        onClick={() => route.history.push(createNewHref)}
      >
        Create new
      </Button>
    )

    return (
      <div className={containerStyle.getClasses()}>
        <div className={styles['top-bar']}>
          {isSmallWindow ? (
            <>
              <div className={styles['mobile-icons']}>
                <button
                  className={styles['open-search']}
                  onClick={this.toggleSearch}
                >
                  <Search fontSize="large" />
                </button>
                <button
                  className={styles['open-filters']}
                  onClick={this.toggleFilters}
                >
                  <FilterList fontSize="large" />
                  {this.filtersArray.length > 0 && (
                    <span className={styles['filter-count']}>
                      ({this.filtersArray.length})
                    </span>
                  )}
                </button>
              </div>

              {createNewButton}
            </>
          ) : selectedFilterIndex === null ? (
            <>
              {this.renderSearchInput()}

              {addFilterButton}

              {clearFiltersButton}

              {createNewButton}
            </>
          ) : (
            this.renderFilterEditor()
          )}
        </div>

        {isSmallWindow && isSearchOpen && (
          <div className={styles.drawer}>
            {this.renderSearchInput()}

            <button
              className={styles['close-search']}
              onClick={this.toggleSearch}
            >
              <Close />
            </button>
          </div>
        )}

        {isSmallWindow && areFiltersOpen && (
          <div className={styles.drawer}>
            {selectedFilterIndex === null ? (
              <>
                <div className={styles['heading-row']}>
                  <h1 className={styles['filter-editor-heading']}>
                    Active filters
                  </h1>

                  <button
                    className={styles['close-filter-editor']}
                    onClick={this.toggleFilters}
                    type="button"
                  >
                    <Close />
                  </button>
                </div>

                <div className={styles.filters}>
                  {this.filtersArray.map(this.renderFilter.bind(this))}
                </div>

                <div className={styles['drawer-buttons']}>
                  {addFilterButton}

                  {clearFiltersButton}
                </div>
              </>
            ) : (
              this.renderFilterEditor()
            )}
          </div>
        )}

        {!isSmallWindow && this.filtersArray.length > 0 && (
          <div className={styles.filters}>
            {this.filtersArray.map(this.renderFilter.bind(this))}
          </div>
        )}
      </div>
    )
  }

  renderFilter(filter, index) {
    const {field, FilterList, operator, operatorFriendly, value} = filter
    const {config} = this.props
    const {selectedFilterIndex} = this.state
    const fieldName = this.getFieldName(field)
    const fieldTypeHasFilterListComponent = typeof FilterList === 'function'
    const nodeField = fieldName && (
      <span className={styles['filter-field']}>{fieldName}</span>
    )
    const nodeOperator = (
      <span className={styles['filter-operator']}>
        {operatorFriendly || operator || DEFAULT_OPERATOR_NAME}
      </span>
    )
    const nodeValue = fieldTypeHasFilterListComponent ? (
      <FilterList
        config={config}
        nodeField={nodeField}
        nodeOperator={nodeOperator}
        value={value}
      />
    ) : null
    const filterStyle = new Style(styles, 'filter').addIf(
      'selected',
      selectedFilterIndex === index
    )

    return (
      <div
        className={filterStyle.getClasses()}
        key={field + operator + value}
        onClick={this.selectFilterToEdit.bind(this, index)}
      >
        {!fieldTypeHasFilterListComponent && nodeField}
        {!fieldTypeHasFilterListComponent && nodeOperator}
        {!fieldTypeHasFilterListComponent && `'${value.toString()}'`}
        {fieldTypeHasFilterListComponent && nodeValue}

        <button
          className={styles['filter-close']}
          onClick={this.removeFilter.bind(this, index)}
        >
          <Close fontSize="small" />
        </button>
      </div>
    )
  }

  renderFilterEditor() {
    const {filters, config, isSmallWindow} = this.props
    const {
      selectedFilterField: field,
      selectedFilterIndex: index,
      selectedFilterOperator: operator,
      selectedFilterValue: value
    } = this.state
    const isUpdate = index !== -1

    // Finding fields that are filterable and don't already have a filter applied.
    // The result is an object mapping filterable field slugs to their human-
    // friendly name.
    const filterableFields = this.getFilterableFields()
    const availableFields = filterableFields
      .filter(slug => field === slug || !filters || filters[slug] === undefined)
      .map(slug => ({value: slug, label: this.getFieldName(slug)}))

    // Applying defaults.
    const modifiedField =
      field || (availableFields[0] && availableFields[0].value)

    const valueIsEmpty = value === null || value === undefined || value === ''
    const {filterEdit: FilterEditComponent, filterOperators: operators = {}} =
      this.getFieldComponent(modifiedField) || {}

    const selectedOperator =
      operator || Object.keys(operators)[0] || DEFAULT_OPERATOR_KEYWORD

    const operatorOptions = Object.entries(operators).map(([value, label]) => ({
      value,
      label
    }))

    operatorOptions.unshift({
      value: DEFAULT_OPERATOR_KEYWORD,
      label: DEFAULT_OPERATOR_NAME
    })

    return (
      <form
        className={styles['filter-editor']}
        onSubmit={this.addOrUpdateFilter.bind(
          this,
          modifiedField,
          selectedOperator
        )}
      >
        {isSmallWindow && (
          <div
            className={`${styles['filter-editor-row']} ${
              styles['heading-row']
            }`}
          >
            <h1 className={styles['filter-editor-heading']}>
              {isUpdate ? 'Edit' : 'Add'} filter
            </h1>

            <button
              className={styles['close-filter-editor']}
              onClick={this.closeFilterEditor}
              type="button"
            >
              <Close />
            </button>
          </div>
        )}
        <div className={styles['filter-editor-row']}>
          <Select
            className={styles['field-selector']}
            onChange={this.selectField}
            options={availableFields}
            value={modifiedField || Object.keys(filterableFields)[0]}
          />

          {operators && (
            <Select
              className={styles['operator-selector']}
              onChange={this.selectOperator}
              options={operatorOptions}
              value={selectedOperator}
            />
          )}
        </div>

        <div className={styles['filter-editor-row']}>
          <FilterEditComponent
            config={config}
            onUpdate={this.setFilterValue}
            value={value}
          />
        </div>

        <div className={styles['filter-editor-row']}>
          <Button
            accent="positive"
            className={styles['update-filter-button']}
            disabled={valueIsEmpty}
            type="submit"
          >
            {isUpdate ? 'Update' : 'Add filter'}
          </Button>

          {isUpdate && (
            <Button
              accent="negative"
              className={styles['remove-filter-button']}
              onClick={this.removeFilter.bind(this, index)}
              type="button"
            >
              Remove
            </Button>
          )}

          <div className={styles.filler} />

          {!isSmallWindow && (
            <button
              className={styles['close-filter-editor']}
              onClick={this.closeFilterEditor}
              type="button"
            >
              <Close />
            </button>
          )}
        </div>
      </form>
    )
  }

  renderSearchInput() {
    const {collection, isSmallWindow, searchableFields} = this.props
    const {search: searchValue, selectedSuggestionIndex} = this.state

    return (
      <form
        className={styles.form}
        onSubmit={this.submitSearch.bind(
          this,
          searchableFields[selectedSuggestionIndex]
        )}
      >
        <TextInput
          autoFocus={isSmallWindow}
          className={styles.input}
          onChange={event =>
            this.setState({
              search: event.target.value
            })
          }
          onKeyDown={this.handleSearchKeydown.bind(this, searchableFields)}
          placeholder={`Search ${collection.name}`}
          ref={this.searchInputRef}
          simple
          value={searchValue}
          tabIndex="1"
        />

        {!isSmallWindow && <Search className={styles['search-icon']} />}

        {searchValue && (
          <div className={styles.suggestions}>
            {searchableFields.map((fieldName, index) => {
              const suggestionStyle = new Style(styles, 'suggestion').addIf(
                'selected',
                selectedSuggestionIndex === index
              )

              return (
                <button
                  className={suggestionStyle.getClasses()}
                  key={fieldName + searchValue}
                  onMouseDown={this.submitSearch.bind(this, fieldName)}
                  onMouseEnter={() =>
                    this.setState({selectedSuggestionIndex: index})
                  }
                  type="button"
                >
                  <span className={styles['suggestion-prefix']}>
                    {this.getFieldName(fieldName)} contains
                  </span>
                  <span className={styles['suggestion-value']}>
                    {' '}
                    ‘{searchValue}’
                  </span>
                  {!isTouchDevice && (
                    <span className={styles['suggestion-hint']}>
                      Search <KeyboardReturn fontSize="small" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </form>
    )
  }

  renderSelectedFilter(value) {
    const message = `is ${value === false ? 'not ' : ''} selected`

    return <span>{message}</span>
  }

  selectField(event) {
    const {value: newField} = event.target
    const {selectedFilterOperator} = this.state
    const fieldComponent = this.getFieldComponent(newField) || {}
    const fieldOperators = fieldComponent.filterOperators || {}

    // If the new selected field supports the currently selected operator, we
    // keep it. Otherwise, we use the first operator defined by the new field
    // component.
    const newOperator = fieldOperators[selectedFilterOperator]
      ? selectedFilterOperator
      : Object.keys(fieldOperators)[0]

    this.setState({
      selectedFilterField: newField,
      selectedFilterOperator: newOperator
    })
  }

  selectFilterToEdit(index) {
    const {field, operator, value} = this.filtersArray[index]

    this.setState({
      selectedFilterField: field,
      selectedFilterIndex: index,
      selectedFilterOperator: operator,
      selectedFilterValue: value
    })
  }

  submitSearch(field, event) {
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
}

const mapState = (state, ownProps) => {
  const {collection, filters} = ownProps
  const {config, windowWidth} = state.app

  // Finding String fields that don't already have filters applied.
  const searchableFields = Object.keys(collection.fields).filter(
    field =>
      collection.fields[field].type.toLowerCase() === 'string' &&
      (!filters || filters[field] === undefined)
  )

  return {
    config,
    isSmallWindow: windowWidth < 768,
    searchableFields
  }
}

export default connectRouter(connectRedux(mapState)(DocumentListController))
