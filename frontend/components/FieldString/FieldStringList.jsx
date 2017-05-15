'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldStringList extends Component {
  static propTypes = {
    /**
     * The field value.
     */
    value: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  static defaultProps = {
    maxLength: 50,
    maxOptions: 1
  }

  render() {
    const {schema, value} = this.props

    // If there's no value, we return `null`.
    if (!value) return null

    // If the value is an array, we render each option individually.
    if (Array.isArray(value)) {
      return this.renderOptions(value, schema)
    }

    // If there's an options block, we render the label of the given option.
    if (schema.publish && schema.publish.options) {
      return this.renderOptions([value], schema)
    }

    return this.renderTrimmedValue(value)
  }

  renderOptions(options, schema) {
    const {maxLength, maxOptions} = this.props
    const optionsBlock = schema.publish && schema.publish.options

    let optionsArray = options

    if (optionsBlock) {
      optionsArray = options.map(option => {
        const match = optionsBlock.find(optionBlock => {
          return optionBlock.value === option
        })

        if (match) {
          return this.renderTrimmedValue(match.label, maxLength / maxOptions)
        }

        return this.renderTrimmedValue(option, maxLength / maxOptions)
      })
    }

    const excessOptions = options.length - maxOptions

    if (excessOptions > 0) {
      optionsArray = optionsArray.slice(0, maxOptions)
    }

    const optionsString = optionsArray.join(', ') + ((excessOptions > 0) ? ` + ${excessOptions}` : '')

    return optionsString
  }

  renderTrimmedValue(value, maxLength) {
    maxLength = Math.floor(maxLength) || this.props.maxLength

    if (value.length > maxLength) {
      return value.slice(0, maxLength - 1) + '…'
    }

    return value
  }
}
