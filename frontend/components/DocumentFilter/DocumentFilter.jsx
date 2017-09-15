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
     * App config.
     */
    config: proptypes.object,

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

  render() {
    const {
      config,
      field, 
      fields, 
      filters,
      index,
      onUpdate,
      type, 
      value
    } = this.props
    if (!fields || !type || !filters || !field) return null

    const controlButtonsStyle = new Style(styles, 'control', 'control-button')
    const controlFieldStyle = new Style(styles, 'control', 'control-field', 'select')
    const controlAnalyserStyle = new Style(styles, 'select', 'control', 'control-analyser')
    const controlValueStyle = new Style(styles, 'input', 'control', 'control-value')
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

        {(field && type && !isNaN(index)) && (
          <FieldFilter
            analyserStyles={controlAnalyserStyle.getClasses()}
            config={config}
            containerStyles={styles['filter-container']}
            index={index}
            onUpdate={onUpdate}
            valueStyles={controlValueStyle.getClasses()}
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

    onUpdate({
      [elementId]: event.target.value
    }, index)
  }

  handleRemove() {
    const {index, onRemove} = this.props

    if (typeof onRemove === 'function') {
      onRemove(index)  
    }
  }
}