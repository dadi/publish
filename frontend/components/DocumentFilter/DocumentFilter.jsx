'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentFilter.css'

import TextInput from 'components/TextInput/TextInput'
import Button from 'components/Button/Button'

/**
 * A document filter.
 */
export default class DocumentFilter extends Component {
  static propTypes = {
    /**
     * The slug of the field being filtered.
     */
    field: proptypes.string,

    /**
     * An object containing the fields available for the given collection.
     * Keys represent field slugs and values hold the field schema.
     */
    fields: proptypes.object,

    /**
     * An object containing the current applied filters.
     */
    filters: proptypes.object,

    /**
     * The index of the current filter within a list of filters.
     */
    index: proptypes.number,

    /**
     * A callback to be fired when the filter is removed.
     */
    onRemove: proptypes.func,

    /**
     * A callback to be fired when the filter is updated.
     */
    onUpdate: proptypes.func,

    /**
     * The type of expression used by the filter.
     */
    type: proptypes.oneOf([
      '$eq',
      '$ne',
      '$nin',
      '$in',
      '$gt',
      '$gte',
      '$lt',
      '$lte'
    ]),

    /**
     * The value used by the filter.
     */
    value: proptypes.string
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
  }

  render() {
    const {
      field, 
      fields, 
      filters,
      type, 
      value
    } = this.props
    const controlFieldStyle = new Style(styles, 'control', 'control-field')
    const controlAnalyserStyle = new Style(styles, 'control', 'control-analyser')
    const controlValueStyle = new Style(styles, 'control', 'control-value')
    const controlButtonsStyle = new Style(styles, 'control', 'control-button')
    let remainingFields = Object.keys(fields)
      .filter(collectionField => collectionField === field || !filters.find(filter => filter.field === collectionField))

    return (
      <div class={styles.filter}>
        <div class={controlFieldStyle.getClasses()}>
          <select
            class={styles.select}
            onChange={this.handleChange.bind(this, 'field')}
          >
            <option disabled selected value>Select a field</option>

            {remainingFields.map(key => (
              <option
                selected={field === key}
                key={key}
                value={key}
              >
                {fields[key].label}
              </option>
            ))}
          </select>
        </div>

        <div class={controlAnalyserStyle.getClasses()}>
          <select
            class={styles.select}
            onChange={this.handleChange.bind(this, 'type')}
          >
            <option disabled selected value>Select a type</option>

            {Object.keys(this.filterTypes).map(key => (
              <option
                selected={type === key}
                key={key}
                value={key}
              >
                {this.filterTypes[key]}
              </option>
            ))}
          </select>
        </div>

        <div
          class={controlValueStyle.getClasses()}
          style={!(field && type) && "display: none;"}
        >
          <TextInput
            className={styles.input}
            value={value}
            onChange={this.handleChange.bind(this, 'value')}
            onKeyUp={this.handleChange.bind(this, 'value')}
            placeholder="Search value"
          />
        </div>

        <div class={controlButtonsStyle.getClasses()}>
          <Button
            className={styles['small-button']}
            onClick={this.handleRemove.bind(this)}
          >-</Button>
        </div>
      </div>
    )
  }

  handleChange(elementId, event) {
    const {onUpdate, index} = this.props

    onUpdate({
      [elementId]: event.target.value
    }, index)
  }

  filterValue(value) {
    if (typeof value === 'string') {
      return value
    }

    return value[Object.keys(value)[0]] || ''
  }

  handleRemove() {
    const {index, onRemove} = this.props

    if (typeof onRemove === 'function') {
      onRemove(index)  
    }
  }
}