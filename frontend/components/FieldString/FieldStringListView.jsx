'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldStringListView extends Component {
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

  constructor(props) {
    super(props)

    this.MAX_LENGTH = 50
    this.MAX_OPTIONS = 1
  }

  render() {
    const {schema, value} = this.props

    // If there's no value, we return `null`.
    if (!value) return null

    // If the value is an array, we render each option individually.
    if (value instanceof Array) {
      return this.renderOptions(value, schema)
    }

    // If there's an options block, we render the label of the given option.
    if (schema.publish && schema.publish.options) {
      return this.renderOptions([value], schema)
    }

    return this.renderTrimmedValue(value)
  }

  renderOptions(options, schema) {
    const optionsBlock = schema.publish && schema.publish.options

    let optionsArray = options

    if (optionsBlock) {
      optionsArray = options.map(option => {
        const match = optionsBlock.find(optionBlock => {
          return optionBlock.value === option
        })

        if (match) {
          return this.renderTrimmedValue(match.label, this.MAX_LENGTH / this.MAX_OPTIONS)
        }

        return this.renderTrimmedValue(option, this.MAX_LENGTH / this.MAX_OPTIONS)
      })
    }

    const excessOptions = options.length - this.MAX_OPTIONS

    if (excessOptions > 0) {
      optionsArray = optionsArray.slice(0, this.MAX_OPTIONS)
    }

    const optionsString = optionsArray.join(', ') + ((excessOptions > 0) ? ` + ${excessOptions}` : '')

    return optionsString
  }

  renderTrimmedValue(value, maxLength) {
    maxLength = Math.floor(maxLength) || this.MAX_LENGTH

    if (value.length > maxLength) {
      return value.slice(0, maxLength - 1) + '…'
    }

    return value
  }
}
