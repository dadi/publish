'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldString.css'

import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type String
 */
export default class FieldString extends Component {
  static propTypes = {
    /**
     * Whether the field contains a validation error.
     */
    error: proptypes.bool,

    /**
     * If true, validation will be executed immediately and not only when the
     * content of the field has changed.
     */
    forceValidation: proptypes.bool,

    /**
     * Callback to be executed when there is a change in the value of the field.
     */
    onChange: proptypes.func,

    /**
     * Callback to be executed when there is a new validation error in the field.
     */
    onError: proptypes.func,

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
    error: false,
    forceValidation: false,
    value: ''
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    const {forceValidation, value} = this.props

    if (forceValidation) {
      this.validate(value)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {forceValidation, value} = this.props

    if (!prevProps.forceValidation && forceValidation) {
      this.validate(value)
    }
  }

  renderAsFreeInput() {
    const {error, value, schema} = this.props
    const publishBlock = schema.publish || {}
    const type = publishBlock.multiline ? 'multiline' : 'text'
    const readOnly = publishBlock.readonly === true

    return (
      <Label
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        label={schema.label}
        comment={schema.required ? 'Required' : 'Optional'}
      >
        <TextInput
          onChange={this.handleOnChange.bind(this)}
          onKeyUp={this.handleOnKeyUp.bind(this)}
          readonly={readOnly}
          type={type}
          value={value}
        />
      </Label>
    )
  }

  renderAsDropdown() {
    const {error, value, schema} = this.props
    const publishBlock = schema.publish || {}
    const options = publishBlock.options
    const selectedValue = value || schema.default || null
    const multiple = publishBlock.multiple === true
    const readOnly = publishBlock.readonly === true
    const dropdownStyle = new Style(styles, 'dropdown')
      .addIf('dropdown-error', error)
      .addIf('dropdown-multiple', multiple)

    return (
      <Label
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        label={schema.label}
        comment={schema.required ? 'Required' : 'Optional'}
      >
        <select
          class={dropdownStyle.getClasses()}
          onChange={this.handleOnChange.bind(this)}
          multiple={multiple}
          disabled={readOnly}
          ref={multiple && this.selectDropdownOptions.bind(this)}
          value={selectedValue}
        >
          {!multiple &&
            <option
              class={styles['dropdown-option']}
              disabled
              selected={selectedValue === null}
            >Please select</option>
          }

          {options.map(option => {
            return (
              <option
                class={styles['dropdown-option']}
                value={option.value}
              >{option.label}</option>
            )
          })}
        </select>
      </Label>
    )
  }

  selectDropdownOptions(input) {
    const {value} = this.props

    if (!input || !input.options) return

    for (let i = 0; i < input.options.length; i++) {
      if (value.includes(input.options[i].value)) {
        input.options[i].selected = true
      }
    }
  }

  render() {
    const {schema} = this.props
    const publishBlock = schema.publish || {}

    if (publishBlock.options) {
      return this.renderAsDropdown()
    }

    return this.renderAsFreeInput()
  }

  getValueOfInput(input) {
    switch (input.nodeName.toUpperCase()) {
      case 'SELECT':
        const options = Array.prototype.slice.call(input.options)
        const value = options.filter(option => option.selected).map(option => option.value)

        // If this isn't a multiple value select, we want to return the selected
        // value as a single element and not wrapped in a one-element array.
        if (!input.attributes.multiple) {
          return value[0]
        }

        return value

      default:
        return input.value
    }
  }

  handleOnChange(event) {
    const {onChange, schema} = this.props
    const value = this.getValueOfInput(event.target)

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, value)
    }
  }

  handleOnKeyUp(event) {
    const value = this.getValueOfInput(event.target)

    this.validate(value)
  }

  findValidationErrorsInString(value) {
    const {error, schema} = this.props
    const validation = (schema && schema.validation) || {}
    const valueLength = typeof value === 'string' ? value.length : 0

    const validationMessage = typeof schema.message === 'string' && schema.message.length ? schema.message : null

    let hasValidationErrors = false

    if (validation) {
      Object.keys(validation).forEach(validationRule => {
        switch (validationRule) {
          case 'minLength':
            if (valueLength < validation.minLength) {
              hasValidationErrors = validationMessage || true
            }

            break

          case 'maxLength':
            if (valueLength > validation.maxLength) {
              hasValidationErrors = validationMessage || true
            }

            break

          case 'regex':
            const regex = new RegExp(validation.regex.pattern, validation.regex.flags)

            if (!regex.test(value)) {
              hasValidationErrors = validationMessage || true
            }

            break
        }
      })
    }

    return hasValidationErrors
  }

  validate(value) {
    const {onError, schema} = this.props

    let hasValidationErrors = false

    // Are we dealing with multiple values?
    if (value instanceof Array) {
      // If the field is required and we don't have any values selected,
      // there's a validation error.
      hasValidationErrors = schema.required && (value.length === 0)

      // If there are no errors so far, we proceed to validate each value
      // in the array as an individual string to check for other validation
      // parameters.
      if (!hasValidationErrors) {
        const individualValidationErrors = value.filter(valueString => {
          return this.findValidationErrorsInString(valueString)
        })

        hasValidationErrors = individualValidationErrors[0] || false
      }
    } else {
      const trimmedValue = typeof value === 'string' ? value.trim() : ''

      // If the field is required and its value is empty, there's a validation
      // error.
      hasValidationErrors = schema.required && (trimmedValue.length === 0)

      // We then proceed to validate the value for other validation parameters.
      hasValidationErrors = hasValidationErrors || this.findValidationErrorsInString(trimmedValue)
    }

    if (typeof onError === 'function') {
      onError.call(this, schema._id, hasValidationErrors, value)
    }
  }
}
