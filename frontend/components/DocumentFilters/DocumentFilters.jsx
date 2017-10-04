'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentFilters.css'

import {isValidJSON, objectToArray, arrayToObject} from 'lib/util'
import {Keyboard} from 'lib/keyboard'

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
     * App config.
     */
    config: proptypes.object,

    /**
     * The JSON-stringified object of filters currently applied.
     */
    filter: proptypes.string.isRequired,

    /**
     * Whether we are creating a new filter.
     */
    newFilter: proptypes.bool,

    /**
     * Change callback method to trigger rendering new url parameters.
     */
    updateUrlParams: proptypes.func
  }

  constructor(props) {
    super(props)

    const {collection} = this.props
    const paramFilters = this.getFiltersFromParams()

    this.keyboard = new Keyboard()
    this.state = {
      dirty: false,
      filters: paramFilters
    }
  }

  getFiltersFromParams () {
    const {filters} = this.props

    return (filters ? objectToArray(filters, 'field') : [])
      .map(this.deconstructFilters.bind(this))
  }

  componentDidMount() {
    this.keyboard.on('cmd+f')
      .do(cmd => {
        const blankFilter = this.createEmptyFilter()
        this.setState({
          filters: this.state.filters.concat([blankFilter])
        })
      })
  }

  componentWillUpdate(nextProps, nextState) {
    const {collection} = this.props
    const {newFilter} = nextProps

    if (nextProps.collection !== collection) {
      // If we're changing collection, reset all filters
      this.setState({filters: []})
    } else {
      this.createOrAppendFilters(newFilter)
    }
  }

  createOrAppendFilters(newFilter) {
    // If we aren't changing collection
    let paramFilters = this.getFiltersFromParams()
    if (newFilter) {
      const blankFilter = this.createEmptyFilter()
      paramFilters.push(blankFilter)
    }

    this.setState({filters: paramFilters})
  }

  componentWillUnmount() {
    this.keyboard.off()
  }

  createEmptyFilter() {
    const {collection} = this.props
    const {filters} = this.state
    const remainingFields = Object.keys(collection.fields)
      .filter(collectionField => !(filters) || !filters.find(filter => filter.field === collectionField))

    return {
      field: remainingFields[0],
      type: '$eq',
      value: null
    }   
  }

  render() {
    const {dirty, filters} = this.state
    const {collection, config} = this.props

    if (!filters || !collection) return null
    return (
      <form class={styles.filters}>
        {filters && collection && filters.map((filter, index) => (
          <DocumentFilter
            config={config}
            field={filter.field}
            fields={collection.fields}
            filters={filters}
            index={index}
            onUpdate={this.handleUpdateFilter.bind(this)}
            onRemove={this.handleRemoveFilter.bind(this)}
            type={filter.type}
            value={filter.value}
          />
        ))}
        {filters && collection && (filters.length > 0) && (
          <Button
            className={styles.submit}
            accent="data"
            disabled={!dirty}
            onClick={this.updateUrl.bind(this)}
            type="submit"
          >Apply {filters.length > 1 ? 'filters' : 'filter'}</Button>
        )}
      </form>
    )
  }

  deconstructFilters(filter) {
    // If there is no filter type and the field value is a string, add a type
    if (typeof filter.value === 'string') {
      return Object.assign(filter, {type: '$eq'})
    } else {
      const type = Object.keys(filter.value)[0]
      const value = filter.value[type]

      return Object.assign(filter, {type: type, value: value})
    }
  }

  constructFilters(filters) {
    return filters.map(filter => {
      return Object.assign({}, filter, {value: {[filter.type]: filter.value}})
    })
  }

  handleRemoveFilter(index) {
    const {filters} = this.state
    const {collection} = this.props
    const newFilters = [...filters]

    newFilters.splice(index, 1)

    this.setState({filters: newFilters})
    this.updateUrl(!newFilters.length)
  }

  handleUpdateFilter(filterProp, index) {
    const {filters} = this.state
    const filter = Object.assign({}, filters[index], filterProp)
    const newFilters = [...filters]

    Object.assign(newFilters[index], filter)

    this.setState({filters: newFilters})

    // {!} To-do: Test filter value against field type validation methods
    // Which should be built into components.
    if (filter.value !== undefined) {
      this.setState({dirty: true})
    }
  }

  updateUrl(clear) {
    // Remove filters with null values
    const {filters} = this.state
    const {updateUrlParams} = this.props
    const constructedFilters = this.constructFilters(filters)
    const filterObj = arrayToObject(constructedFilters, 'field')

    if (
      (filterObj || clear) &&
      typeof updateUrlParams === 'function'
    ) {
      updateUrlParams(filterObj)
    }

    this.setState({dirty: false})
  }
}
