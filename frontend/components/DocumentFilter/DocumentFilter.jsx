'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import * as fieldComponents from 'lib/field-components'
import Style from 'lib/Style'
import styles from './DocumentFilter.css'

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
      '$gt': 'Greater than',
      '$gte': 'Greater than or Equal to',
      '$in': 'Is one of',
      '$lt': 'Less than',
      '$lt': 'Less than',
      '$ne': 'Is not',
      '$nin': 'Is not one of',
      '$regex': 'Contains'
    }
    // this.fieldFilters = {
    //   'Reference': {
    //     filters: {
    //       '$eq': 'Equals',
    //       '$in': 'Is one of',
    //       '$ne': 'Is not',
    //       '$nin': 'Is not one of'
    //     }
    //   },
    //   'String': {
    //     filters: {
    //       '$eq': 'Equals',
    //       '$ne': 'Is not',
    //       '$regex': 'Contains'
    //     }
    //   },
    //   'Boolean': {
    //     options: {
    //       'true': 'true',
    //       'false': false
    //     }
    //   },
    //   'Number': {
    //     filters: {
    //       '$eq': 'Is',
    //       ''
    //     }
    //   }
    //   'String': ['$eq', '$ne'],
    //   'Boolean': ['$eq', '$ne'],
    //   'Number': ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte'],
    //   'DateTime': ['$eq']
    // }
  }

  render() {
    const {
      field, 
      fields, 
      filters,
      type, 
      value
    } = this.props
    const controlButtonsStyle = new Style(styles, 'control', 'control-button')
    const controlFieldStyle = new Style(styles, 'control', 'control-field', 'select')
    const controlAnalyserStyle = new Style(styles, 'select', 'control', 'control-analyser')
    const controlValueStyle = new Style(styles, 'input', 'control', 'control-value')
    // const controlButtonsStyle = new Style(styles, 'control', 'control-button')
    const currentField = fields[field]
    const fieldComponentName = `Field${currentField.type}`
    const FieldFilter = fieldComponents[fieldComponentName] && fieldComponents[fieldComponentName].filter
    const handleTypeChange = this.handleChange.bind(this, 'type')
    const handleValueChange = this.handleChange.bind(this, 'value')
    const remainingFields = Object.keys(fields)
      .filter(collectionField => collectionField === field || !filters.find(filter => filter.field === collectionField))

    return (
      <div class={styles.filter}>
        <select
          class={controlFieldStyle.getClasses()}
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

        {(field && type) && (
          <FieldFilter
            containerStyles={styles['filter-container']}
            onTypeChange={handleTypeChange}
            onValueChange={handleValueChange}
            valueStyles={controlValueStyle.getClasses()}
            analyserStyles={controlAnalyserStyle.getClasses()}
            type={type}
            value={value}
          />
        )}

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
    const val = event.target ? event.target.value : event

    onUpdate({
      [elementId]: val
    }, index)
  }

  handleRemove() {
    const {index, onRemove} = this.props

    if (typeof onRemove === 'function') {
      onRemove(index)  
    }
  }
}