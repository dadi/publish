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
export default class FieldStringEdit extends Component {
  static propTypes = {
    /**
     * The name of the collection being edited, as per the URL.
     */
    collection: proptypes.string,

    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The schema of the API being used.
     */
    currentApi: proptypes.object,

    /**
     * The schema of the collection being edited.
     */
    currentCollection: proptypes.object,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * If defined, contains an error message to be displayed by the field.
     */
    error: proptypes.string,

    /**
     * Whether the field should be validated as soon as it mounts, rather than
     * waiting for a change event.
     */
    forceValidation: proptypes.bool,

    /**
     * If defined, specifies a group where the current collection belongs.
     */
    group: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * a successful state. The function receives the name of the field and the
     * new value as arguments.
     */
    onChange: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * or from an error state. The function receives the name of the field, a
     * Boolean value indicating whether or not there's an error and finally the
     * new value of the field.
     */
    onError: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.bool
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

  render() {
    const {schema} = this.props
    const publishBlock = schema.publish

    if (publishBlock.options) {
      return this.renderAsDropdown()
    }

    return this.renderAsFreeInput()
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
        comment={schema.required && 'Required'}
      >
        <TextInput
          onChange={this.handleOnChange.bind(this)}
          onKeyUp={this.handleOnKeyUp.bind(this)}
          placeholder={schema.placeholder}
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
    const selectLabel = `Please select${schema.label ? ` ${schema.label}` : ''}`
    const multiple = publishBlock.multiple === true
    const readOnly = publishBlock.readonly === true
    const dropdownStyle = new Style(styles, 'dropdown')
      .addIf('dropdown-error', error)
      .addIf('dropdown-multiple', multiple)

    return (
      <Label
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        label={schema.label || schema._id}
        comment={schema.required && 'Required'}
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
              value=""
              class={styles['dropdown-option']}
              disabled
              selected={selectedValue === null}
            >{selectLabel}</option>
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

  findValidationErrorsInValue(value) {
    const {error, schema} = this.props
    const valueLength = typeof value === 'string' ? value.length : 0

    // If the value is empty but the field has a default defined, it's fine.
    if ((valueLength === 0) && schema.default) {
      return false
    }

    const validation = (schema && schema.validation) || {}
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

  handleOnChange(event) {
    const {onChange, schema} = this.props
    const value = this.getValueOfInput(event.target)

    this.validate(value)

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, value)
    }
  }

  handleOnKeyUp(event) {
    const value = this.getValueOfInput(event.target)

    this.validate(value)
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

  validate(value) {
    const {onError, schema} = this.props

    let hasValidationErrors = false

    // Are we dealing with multiple values?
    if (Array.isArray(value)) {
      // If the field is required and we don't have any values selected,
      // there's a validation error.
      hasValidationErrors = schema.required && (value.length === 0)

      // If there are no errors so far, we proceed to validate each value
      // in the array as an individual string to check for other validation
      // parameters.
      if (!hasValidationErrors) {
        const individualValidationErrors = value.map(valueString => {
          return this.findValidationErrorsInValue(valueString)
        }).filter(Boolean)

        if (individualValidationErrors.length > 0) {
          const errorWithMessage = individualValidationErrors.find(error => {
            return typeof error === 'string'
          })

          hasValidationErrors = errorWithMessage || true
        }
      }
    } else {
      const trimmedValue = typeof value === 'string' ? value.trim() : ''

      // If the field is required, its value is empty and there's no default,
      // there's a validation error.
      hasValidationErrors = schema.required && !schema.default && (trimmedValue.length === 0)

      // We then proceed to validate the value for other validation parameters.
      hasValidationErrors = hasValidationErrors || this.findValidationErrorsInValue(trimmedValue)
    }

    if (typeof onError === 'function') {
      onError.call(this, schema._id, hasValidationErrors, value)
    }
  }
}
