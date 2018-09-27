'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldDateTime.css'

import DateTimePicker from 'components/DateTimePicker/DateTimePicker'
import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

import DateTime from 'lib/datetime'

/**
 * Component for API fields of type DateTime
 */
export default class FieldDateTimeEdit extends Component {
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

  constructor(props) {
    super(props)

    this.state.pickerVisible = false

    this.picker = false
    this.pickerEventHandler = this.handlePickerClick.bind(this, true)
    this.pickerOutsideEventHandler = this.handlePickerClick.bind(this, false)
    this.losingFocusTimeout = null
  }

  render() {
    let {
      comment,
      config,
      displayName,
      error, 
      required,
      schema, 
      value
    } = this.props
    const {pickerVisible} = this.state
    const publishBlock = schema.publish || {}
    comment = comment || (required && 'Required')

    let dateObj = null

    if (value) {
      const dateTimeObj = new DateTime(value)

      if (dateTimeObj.isValid()) {
        dateObj = dateTimeObj
      }
    }

    return (
      <Label
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        label={displayName}
        comment={comment}
      >
        <TextInput
          onBlur={this.handleFocus.bind(this, false)}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this, true)}
          readonly={publishBlock.readonly === true}
          type="text"
          value={dateObj && dateObj.format(config.formats.date.long)}
        />

        {pickerVisible &&
          <div ref={this.handlePickerRef.bind(this)}>
            <DateTimePicker
              className={styles.picker}
              date={dateObj && dateObj.getDate()}
              onChange={this.handlePickerChange.bind(this)}
            />
          </div>
        }
      </Label>
    )
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
    const {
      config,
      name,
      onChange,
      schema,
      value
    } = this.props
    const newDate = new DateTime(event.target.value, config.formats.date.long)

    let newValue = null

    if (event.target.value.length > 0) {
      if (newDate.isValid()) {
        newValue = newDate.getDate().toISOString()
      } else {
        newValue = value
      }
    }

    if (typeof onChange === 'function') {
      onChange.call(this, name, newValue)
    }
  }

  handleFocus(hasFocus) {
    const {pickerVisible} = this.state

    this.hasFocus = hasFocus

    if (!pickerVisible) {
      this.setState({
        pickerVisible: true
      })
    }

    if (!hasFocus && pickerVisible) {
      clearTimeout(this.losingFocusTimeout)

      this.losingFocusTimeout = setTimeout(() => {
        this.setState({
          pickerVisible: false
        })
      }, 200)
    }
  }

  handlePickerChange(newDate) {
    const {name, onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, name, newDate.toISOString())
    }
  }

  handlePickerClick(insidePicker, event) {
    const {pickerVisible} = this.state

    if (insidePicker) {
      event.stopPropagation()

      clearTimeout(this.losingFocusTimeout)
    } else {
      if (pickerVisible && !this.hasFocus) {
        this.setState({
          pickerVisible: false
        })
      }
    }
  }

  handlePickerRef(element) {
    if (this.picker) return

    element.addEventListener('click', this.pickerEventHandler)

    this.picker = element
  }
}
