'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentFilters.css'

import {arrayToObject, isValidJSON, objectToArray} from 'lib/util'
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
     * Counter to mark the addition of new filters.
     */
    forceNewFilters: proptypes.number,

    /**
     * Change callback method to trigger rendering new url parameters.
     */
    updateUrlParams: proptypes.func
  }

  constructor(props) {
    super(props)

    this.keyboard = new Keyboard()
    this.state = {
      dirty: false,
      filters: this.getFiltersFromParams()
    }
  }

  componentDidMount() {
    this.keyboard.on('cmd+f').do(cmd => {
      this.setState({
        filters: this.state.filters.concat(this.createEmptyFilter())
      })
    })
  }

  componentWillUnmount() {
    this.keyboard.off()
  }

  componentDidUpdate(prevProps) {
    const {collection, forceNewFilters} = this.props
    const currentCollection = collection || {}
    const previousCollection = prevProps.collection || {}

    // If we're changing collection, reset all filters.
    if (currentCollection.path !== previousCollection.path) {
      this.setState({
        filters: []
      })
    } else if (forceNewFilters && (forceNewFilters > prevProps.forceNewFilters)) {
      let filters = this.getFiltersFromParams()

      this.setState({
        filters: filters.concat(this.createEmptyFilter())
      })
    }
  }

  constructFilters(filters) {
    return filters.map(filter => {
      return Object.assign({}, filter, {value: {[filter.type]: filter.value}})
    })
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

  getFiltersFromParams() {
    const {filters} = this.props

    if (!filters) return []

    let deconstructedFilters = objectToArray(filters, 'field')
      .map(filter => {
        if (typeof filter.value === 'string') {
          return Object.assign(filter, {type: '$eq'})
        }

        let type = Object.keys(filter.value)[0]
        let value = filter.value[type]

        return Object.assign({}, filter, {
          type,
          value
        })
      })

    return deconstructedFilters
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

    this.setState({filters: newFilters, dirty: true})
  }

  render() {
    const {dirty, filters} = this.state
    const {
      collection,
      config,
      forceFirstFilter
    } = this.props

    if (!collection || !filters) return null

    return (
      <form class={styles.filters}>
        {filters.map((filter, index) => (
          <DocumentFilter
            config={config}
            field={filter.field}
            fields={collection.fields}
            filters={filters}
            index={index}
            onRemove={this.handleRemoveFilter.bind(this)}
            onUpdate={this.handleUpdateFilter.bind(this)}
            type={filter.type}
            value={filter.value}
          />
        ))}

        {(filters.length > 0) && (
          <Button
            accent="data"
            className={styles.submit}
            disabled={!dirty}
            onClick={this.updateUrl.bind(this)}
            type="submit"
          >Apply {filters.length > 1 ? 'filters' : 'filter'}</Button>
        )}
      </form>
    )
  }

  updateUrl(clear) {
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
