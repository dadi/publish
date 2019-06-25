import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
import RichEditor from 'components/RichEditor/RichEditor'
import Style from 'lib/Style'
import styles from './FieldString.css'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type String
 */
export default class FieldStringEdit extends React.Component {
  static propTypes = {
    /**
     * The schema of the collection being edited.
     */
    collection: proptypes.object,

    /**
     * The application configuration object.
     */
    config: proptypes.object,

    /**
     * The unique cache key for the document being edited.
     */
    contentKey: proptypes.string,

    /**
     * The human-friendly name of the field, to be displayed as a label.
     */
    displayName: proptypes.string,

    /**
     * If defined, contains an error message to be displayed by the field.
     */
    error: proptypes.string,

    /**
     * A metadata object associated with the value.
     */
    meta: proptypes.object,

    /**
     * The name of the field within the collection.
     */
    name: proptypes.string,

    /**
     * A callback to be fired whenever the value of the field changes. The
     * function will be called with the updated value as the first argument
     * and an optional error message as the second. This second argument gives
     * each field component the ability to perform their own validaton logic,
     * in addition to the central validation routine taking place upstream.
     */
    onChange: proptypes.func,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * or from an error state. The function receives the name of the field, a
     * Boolean value indicating whether or not there's an error and finally the
     * new value of the field.
     */
    onError: proptypes.func,

    /**
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onSave` callback with the store. That callback is then
     * fired before the field is saved, allowing the function to modify its
     * value before it is persisted.
     */
    onSaveRegister: proptypes.func,

    /**
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onValidate` callback with the store. That callback is then
     * fired when the field is validated, overriding the default validation
     * method introduced by the API validator module.
     */
    onValidateRegister: proptypes.func,

    /**
     * Whether the field is read-only.
     */
    readOnly: proptypes.bool,

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
    value: proptypes.oneOfType([
      proptypes.arrayOf(proptypes.string),
      proptypes.object,
      proptypes.string
    ])
  }

  static defaultProps = {
    error: false,
    value: ''
  }

  constructor(props) {
    super(props)

    this.state = {
      hasFocus: false
    }
  }

  getValueOfDropdown(element) {
    const selectedOptions = Array.from(
      element.selectedOptions,
      item => item.value
    )

    // If this isn't a multiple value select, we want to return the selected
    // value as a single element and not wrapped in a one-element array.
    if (element.attributes.multiple) {
      return selectedOptions
    }

    return selectedOptions[0]
  }

  handleFocusChange(hasFocus) {
    this.setState({
      hasFocus
    })
  }

  handleOnChange(value, options) {
    const {onChange} = this.props

    // We prefer sending a `null` over an empty string.
    const sanitisedValue = value === '' ? null : value

    if (typeof onChange === 'function') {
      onChange.call(this, sanitisedValue, options)
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
    const {
      comment,
      displayName,
      error,
      name,
      readOnly,
      required,
      schema,
      value
    } = this.props
    const publishBlock = schema.publish || {}
    const options = publishBlock.options
    const selectLabel = `Please select${schema.label ? ` ${schema.label}` : ''}`
    const multiple = publishBlock.multiple === true
    const dropdownStyle = new Style(styles, 'dropdown')
      .addIf('dropdown-error', error)
      .addIf('dropdown-multiple', multiple)

    let selectedValue = value || schema.default || ''

    if (multiple && !Array.isArray(selectedValue)) {
      selectedValue = [selectedValue]
    }

    return (
      <Label
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        label={displayName}
        comment={
          comment ||
          (required && 'Required') ||
          (readOnly && 'Read only') ||
          null
        }
      >
        <select
          className={dropdownStyle.getClasses()}
          disabled={readOnly}
          onChange={el =>
            this.handleOnChange(this.getValueOfDropdown(el.target))
          }
          multiple={multiple}
          name={name}
          ref={this.selectDropdownOptions.bind(this, multiple)}
          value={selectedValue}
        >
          {!multiple && (
            <option className={styles['dropdown-option']} disabled value="">
              {selectLabel}
            </option>
          )}

          {options.map(option => {
            return (
              <option
                className={styles['dropdown-option']}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
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
    const {
      display = {},
      heightType,
      multiline,
      readonly,
      rows,
      resizable
    } = publishBlock
    const type = multiline ? 'multiline' : 'text'
    const readOnly = readonly === true

    // Is the field flagged as a link?
    const isLink =
      display.link &&
      typeof value === 'string' &&
      value.indexOf('http://') * value.indexOf('https://') === 0
    const formattedLink =
      typeof display.link === 'string'
        ? display.link.replace(/{value}/, value)
        : value

    return (
      <Label
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
        comment={
          comment ||
          (required && 'Required') ||
          (readOnly && 'Read only') ||
          null
        }
      >
        <TextInput
          heightType={heightType}
          name={name}
          onBlur={this.handleFocusChange.bind(this, false)}
          onInput={el => this.handleOnChange(el.target.value)}
          onFocus={this.handleFocusChange.bind(this, true)}
          placeholder={placeholder}
          readOnly={readOnly}
          resizable={resizable}
          rows={rows}
          type={type}
          value={value}
        />

        {isLink && (
          <Button
            accent="neutral"
            className={styles['link-preview']}
            href={formattedLink}
            openInNewWindow={true}
            size="small"
          >
            Open in new window
          </Button>
        )}
      </Label>
    )
  }

  renderAsRichEditor(format) {
    const {
      contentKey,
      displayName,
      error,
      name,
      required,
      onSaveRegister,
      onValidateRegister,
      value
    } = this.props
    const {hasFocus} = this.state
    const fieldContentKey = JSON.stringify({
      fieldName: name
    })

    return (
      <Label
        comment={(required && 'Required') || null}
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
      >
        <RichEditor
          contentKey={contentKey + fieldContentKey}
          format={format}
          onBlur={this.handleFocusChange.bind(this, false)}
          onChange={this.handleOnChange.bind(this)}
          onFocus={this.handleFocusChange.bind(this, true)}
          onSaveRegister={onSaveRegister}
          onValidateRegister={onValidateRegister}
          value={value}
        />
      </Label>
    )
  }

  selectDropdownOptions(isMultiple, input) {
    const {value} = this.props

    if (!input || !input.options || !isMultiple) return

    for (let i = 0; i < input.options.length; i++) {
      if (value.includes(input.options[i].value)) {
        input.options[i].selected = true
      }
    }
  }
}
