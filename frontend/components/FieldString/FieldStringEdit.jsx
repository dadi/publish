'use strict'

import {h, Component} from 'preact'
import {route} from '@dadi/preact-router'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldString.css'

import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import RichEditor from 'components/RichEditor/RichEditor'
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
     * The text to be rendered on the top-right corner of the field.
     */
    comment: proptypes.string,

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
     * The human-friendly name of the field, to be displayed as a label.
     */
    displayName: proptypes.string,

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
     * The name of the field within the collection. May be a path using
     * dot-notation.
     */
    name: proptypes.string,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

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
     * An optional string to display as placeholder text.
     */
    placeholder: proptypes.string,

    /**
     * Whether the field is required.
     */
    required: proptypes.bool,

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

    this.state.hasFocus = false
  }

  componentDidMount() {
    const {
      forceValidation,
      meta = {},
      value
    } = this.props

    if (meta.image && typeof this.insertImageCallback === 'function') {
      this.insertImageCallback(
        meta.image.selection[0].url,
        meta.image.position
      )
    }

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
            if (valueLength > 0 && valueLength < validation.minLength) {
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

  getValueOfDropdown(element) {
    let options = Array.prototype.slice.call(element.options)
    let value = options.filter(option => option.selected).map(option => option.value)

    // If this isn't a multiple value select, we want to return the selected
    // value as a single element and not wrapped in a one-element array.
    if (!element.attributes.multiple) {
      return value[0]
    }

    return value
  }

  handleFocusChange(hasFocus) {
    this.setState({
      hasFocus
    })
  }

  handleImageSelect(position) {
    const {
      name,
      onBuildBaseUrl
    } = this.props

    let selectImageUrl = onBuildBaseUrl({
      referenceFieldSelect: name,
      search: {
        position
      }
    })

    route(selectImageUrl)
  }  

  handleOnChange(value) {
    const {name, onChange, schema} = this.props

    // We prefer sending a `null` over an empty string.
    let sanitisedValue = value === '' ? null : value

    this.validate(sanitisedValue)

    if (typeof onChange === 'function') {
      onChange.call(this, name, sanitisedValue)
    }
  }

  render() {
    const {schema} = this.props
    const publishBlock = schema.publish

    if (publishBlock && publishBlock.options) {
      return this.renderAsDropdown()
    }

    if (schema.format) {
      return this.renderAsRichEditor(schema.format)
    }

    return this.renderAsFreeInput()
  }

  renderAsDropdown() {
    let {
      comment,
      displayName,
      error,
      name,
      required,
      schema,
      value
    } = this.props
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
        label={displayName}
        comment={comment || (required && 'Required') || (readOnly && 'Read only')}
      >
        <select
          class={dropdownStyle.getClasses()}
          disabled={readOnly}
          onChange={el => this.handleOnChange(this.getValueOfDropdown(el.target))}
          multiple={multiple}
          name={name}
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

  renderAsFreeInput() {
    const {
      comment,
      displayName,
      error,
      name,
      placeholder,
      required,
      schema,
      value
    } = this.props
    const {hasFocus} = this.state
    const publishBlock = schema.publish || {}
    const {heightType, rows, resizable} = publishBlock
    const type = publishBlock.multiline ? 'multiline' : 'text'
    const readOnly = publishBlock.readonly === true

    let link = publishBlock.display && publishBlock.display.link
    let linkFormatted = false

    if (link && typeof link === 'string') {
      linkFormatted = link.replace(/{value}/, value)
    }

    return (
      <Label
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
        comment={comment || (required && 'Required') || (readOnly && 'Read only')}
      >
        <TextInput
          heightType={heightType}
          name={name}
          onBlur={this.handleFocusChange.bind(this, false)}
          onInput={el => this.handleOnChange(el.target.value)}
          onFocus={this.handleFocusChange.bind(this, true)}
          placeholder={placeholder}
          readonly={readOnly}
          resizable={resizable}
          rows={rows}
          type={type}
          value={value}
        />
        {link && (
          <Button
            accent="neutral"
            size="small"
            href={linkFormatted || value} 
            className={styles['link-preview']}
          >Open in new window</Button>
        )}
      </Label>
    )
  }

  renderAsRichEditor(format) {
    const {
      displayName,
      error,
      meta,
      name,
      placeholder,
      required,
      schema,
      value
    } = this.props
    const {hasFocus} = this.state
    
    return (
      <Label
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
        comment={required && 'Required'}
      >
        <RichEditor
          format={format}
          insertImageCallback={callback => this.insertImageCallback = callback}
          onBlur={this.handleFocusChange.bind(this, false)}
          onImageInsert={this.handleImageSelect.bind(this)}
          onChange={this.handleOnChange.bind(this)}
          onFocus={this.handleFocusChange.bind(this, true)}
          value={value}
        />        
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

  validate(value) {
    const {name, onError, required, schema} = this.props

    let hasValidationErrors = false

    // Are we dealing with multiple values?
    if (Array.isArray(value)) {
      // If the field is required and we don't have any values selected,
      // there's a validation error.
      hasValidationErrors = required && (value.length === 0)

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
      hasValidationErrors = required && !schema.default && (trimmedValue.length === 0)

      // We then proceed to validate the value for other validation parameters.
      hasValidationErrors = hasValidationErrors || this.findValidationErrorsInValue(trimmedValue)
    }

    if (typeof onError === 'function') {
      onError.call(this, name, hasValidationErrors, value)
    }
  }
}
