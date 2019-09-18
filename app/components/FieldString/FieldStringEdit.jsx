import {Button, Select, TextInput} from '@dadi/edit-ui'
import formatLink from 'lib/util/formatLink'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
import RichEditor from 'components/RichEditor/RichEditor'
import SortableList from 'components/SortableList/SortableList'
import Style from 'lib/Style'
import styles from './FieldString.css'

function getValueOfDropdown(element) {
  const selectedOptions = Array.from(
    element.selectedOptions,
    item => item.value
  )

  // If this isn't a multiple value select, we want to return the selected
  // value as a single element and not wrapped in a one-element array.
  return element.attributes.multiple ? selectedOptions : selectedOptions[0]
}

function openLink(href) {
  window.open(/^\w+:\/\//.exec(href) ? href : 'http://' + href, '_blank')
}

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

    this.handleBlur = () => this.setState({hasFocus: false})
    this.handleFocus = () => this.setState({hasFocus: true})
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleInputChangeEvent = e => this.handleInputChange(e.target.value)
    this.handleSelectionChangeEvent = e =>
      this.handleInputChange(getValueOfDropdown(e.target))

    this.state = {
      hasFocus: false
    }
  }

  handleInputChange(value, options) {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      // We prefer sending a `null` over an empty string.
      onChange(value || null, options)
    }
  }

  render() {
    const {
      comment,
      displayName,
      error,
      readOnly,
      required,
      schema,
      value
    } = this.props
    const publishBlock = schema.publish

    let content

    if (publishBlock && publishBlock.options) {
      content = this.renderAsDropdown()
    } else if ((publishBlock && publishBlock.list) || Array.isArray(value)) {
      content = this.renderAsList()
    } else if (schema.format) {
      content = this.renderAsRichEditor(schema.format)
    } else {
      content = this.renderAsFreeInput()
    }

    return (
      <Label
        comment={
          comment ||
          (required && 'Required') ||
          (readOnly && 'Read only') ||
          null
        }
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        label={displayName}
      >
        {content}
      </Label>
    )
  }

  renderAsDropdown() {
    const {error, name, readOnly, schema, value} = this.props
    const publishBlock = schema.publish || {}
    const {multiple, options} = publishBlock

    let selectedValue = value || schema.default || ''

    if (multiple && !Array.isArray(selectedValue)) {
      selectedValue = [selectedValue]
    }

    const placeholder = {
      disabled: true,
      label: ('Please select ' + (schema.label || '')).trim(),
      value: ''
    }

    return (
      <Select
        inFieldComponent
        name={name}
        options={multiple ? options : [placeholder, ...options]}
        value={selectedValue}
        multiple={multiple}
        onChange={this.handleSelectionChangeEvent}
        readOnly={readOnly}
      />
    )
  }

  renderAsFreeInput() {
    const {error, name, placeholder, schema, value} = this.props
    const publishBlock = schema.publish || {}
    const {display = {}, multiline, readonly, resizable, rows} = publishBlock

    const link = formatLink(value, display.link)

    return (
      <div className={styles['free-input-wrapper']}>
        <TextInput
          accent={error ? 'error' : undefined}
          autoresize={multiline}
          multiline={multiline}
          name={name}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          onChange={this.handleInputChangeEvent}
          placeholder={placeholder}
          readOnly={readonly}
          resizable={resizable}
          rows={rows}
          type="text"
          value={value}
        />

        {link && (
          <Button accent="positive" narrow onClick={() => openLink(value)}>
            <span>Open </span>
            <i className="material-icons" id={styles['open-icon']}>
              open_in_new
            </i>
          </Button>
        )}
      </div>
    )
  }

  renderAsList() {
    const {name, placeholder, schema, value} = this.props
    const {publish: publishSettings = {}} = schema

    return (
      <SortableList
        name={name}
        onBlur={this.handleBlur}
        onChange={this.handleInputChange}
        onFocus={this.handleBlur}
        placeholder={placeholder}
        publishSettings={publishSettings}
        valuesArray={value}
      />
    )
  }

  renderAsRichEditor(format) {
    const {
      contentKey,
      name,
      onSaveRegister,
      onValidateRegister,
      value
    } = this.props
    const fieldContentKey = JSON.stringify({
      fieldName: name
    })

    return (
      <RichEditor
        contentKey={contentKey + fieldContentKey}
        format={format}
        onBlur={this.handleBlur}
        onChange={this.handleInputChange}
        onFocus={this.handleFocus}
        onSaveRegister={onSaveRegister}
        onValidateRegister={onValidateRegister}
        value={value}
      />
    )
  }
}
