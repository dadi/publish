import ColorPicker from 'components/ColorPicker/ColorPicker'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
import styles from './FieldColor.css'
import {TextInput} from '@dadi/edit-ui'

/**
 * Component for API fields of type Color
 */
export default class FieldColorEdit extends React.Component {
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
     * The name of the field within the collection. May be a path using
     * dot-notation.
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
    value: proptypes.string
  }

  constructor(props) {
    super(props)

    this.picker = false
    this.pickerEventHandler = this.handlePickerClick.bind(this, true)
    this.pickerOutsideEventHandler = this.handlePickerClick.bind(this, false)
    this.state = {
      hasFocus: false,
      isPickerVisible: false
    }
  }

  componentDidMount() {
    window.addEventListener('click', this.pickerOutsideEventHandler)
  }

  componentWillUnmount() {
    if (this.picker) {
      this.picker.removeEventListener('click', this.pickerOutsideEventHandler)
    }

    clearTimeout(this.losingFocusTimeout)
  }

  handleChange(event) {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, event.target.value)
    }
  }

  handleFocus(hasFocus) {
    const {isPickerVisible} = this.state
    const {schema} = this.props
    const publishBlock = schema.publish || {}

    // Return from focus event so picker doesn't display
    if (publishBlock.readonly === true) {
      return
    }

    this.hasFocus = hasFocus

    this.setState({
      hasFocus
    })

    if (!isPickerVisible) {
      this.setState({
        isPickerVisible: true
      })
    }
  }

  handlePickerChange(newColor) {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, newColor)
    }
  }

  handlePickerClick(insidePicker, event) {
    const {isPickerVisible} = this.state

    if (insidePicker) {
      event.stopPropagation()
    } else {
      if (isPickerVisible && !this.hasFocus) {
        this.setState({
          isPickerVisible: false
        })
      }
    }
  }

  handlePickerRef(element) {
    if (this.picker) return

    element.addEventListener('click', this.pickerEventHandler)

    this.picker = element
  }

  render() {
    const {
      comment,
      config,
      displayName,
      error,
      hasUnsavedChanges,
      name,
      required,
      schema,
      value
    } = this.props
    const {isPickerVisible} = this.state
    const publishBlock = schema.publish || {}

    return (
      <Label
        accent={hasUnsavedChanges ? 'info' : null}
        className={styles.label}
        comment={
          comment ||
          (required && 'Required') ||
          (publishBlock.readonly && 'Read only')
        }
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        label={displayName}
      >
        <div className={styles.container}>
          <div
            className={styles.swatch}
            style={value ? {backgroundColor: `#${value}`} : null}
          />

          <TextInput
            accent={hasUnsavedChanges ? 'info' : null}
            name={name}
            onBlur={this.handleFocus.bind(this, false)}
            onChange={this.handleChange.bind(this)}
            onFocus={this.handleFocus.bind(this, true)}
            readonly={publishBlock.readonly === true}
            value={value}
          />

          {isPickerVisible && (
            <div ref={this.handlePickerRef.bind(this)}>
              <ColorPicker
                className={styles.picker}
                format={publishBlock.format || 'hex'}
                onChange={this.handlePickerChange.bind(this)}
                value={value}
              />
            </div>
          )}
        </div>
      </Label>
    )
  }
}
