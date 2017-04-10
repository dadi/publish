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
export default class FieldDateTime extends Component {
  constructor(props) {
    super(props)

    this.state.pickerVisible = false

    // We're using this format for all DateTime fields for now, but we could
    // introduce a property in the publish block that allows DateTime fields
    // to choose how they're formatted.
    this.DEFAULT_DATE_FORMAT = 'DD/MM/YY HH:mm'

    this.picker = false
    this.pickerEventHandler = this.handlePickerClick.bind(this, true)
    this.pickerOutsideEventHandler = this.handlePickerClick.bind(this, false)
    this.losingFocusTimeout = null
  }

  render() {
    const {error, schema, value} = this.props
    const {pickerVisible} = this.state
    const publishBlock = schema.publish || {}

    let dateObj = null

    if (value) {
      const dateTimeObj = new DateTime(value)

      if (dateTimeObj.isValid()) {
        dateObj = dateTimeObj
      }
    }

    return (
      <Label
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        label={schema.label}
        comment={schema.required ? 'Required' : 'Optional'}
      >
        <TextInput
          onBlur={this.handleFocus.bind(this, false)}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this, true)}
          readonly={publishBlock.readonly === true}
          type="text"
          value={dateObj && dateObj.format(this.DEFAULT_DATE_FORMAT)}
        />

        <div ref={this.handlePickerRef.bind(this)}>
          {pickerVisible &&
            <DateTimePicker
              className={styles.picker}
              date={dateObj.getDate()}
              onChange={this.handlePickerChange.bind(this)}
            />
          }
        </div>
      </Label>
    )
  }

  componentDidMount() {
    window.addEventListener('click', this.pickerOutsideEventHandler)
  }

  componentWillUnmount() {
    if (this.picker) {
      this.picker.removeEventListener('click', this.pickerEventHandler)
    }

    clearTimeout(this.losingFocusTimeout)
  }

  handleChange(event) {
    const {onChange, schema, value} = this.props
    const newDate = new DateTime(event.target.value, this.DEFAULT_DATE_FORMAT)

    let newValue

    if (event.target.value.length > 0) {
      if (newDate.isValid()) {
        newValue = newDate.getDate().toISOString()
      } else {
        newValue = value
      }
    } else {
      newValue = null
    }

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, newValue)
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
    const {onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, newDate.toISOString())
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
