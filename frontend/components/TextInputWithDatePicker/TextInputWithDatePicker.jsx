'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './TextInputWithDatePicker.css'

import DateTimePicker from 'components/DateTimePicker/DateTimePicker'
import TextInput from 'components/TextInput/TextInput'

import DateTime from 'lib/datetime'

/**
 * Component for API fields of type DateTime
 */
export default class TextInputWithDatePicker extends Component {
  static propTypes = {
    /**
     * Classes to append to the button element.
     */
    className: proptypes.string,

    /**
     * Format to be used by the DateTime object.
     */
    format: proptypes.string,

    /**
     * DOM ID for the input field.
     */
    id: proptypes.string,

    /**
     * Whether the field is part of a `<Label/>` component. This makes it inherit certain CSS properties from the parent.
     *
     * **NOTE:** This prop is automatically passed down by `<Label/>`.      
     */
    inLabel: proptypes.bool,

    /**
     * Callback to be executed when the text loses focus (onBlur event).
     */
    onBlur: proptypes.func,

    /**
     * Callback to be executed when the text is changed (onChange event).
     */
    onChange: proptypes.func,

    /**
     * Callback to be executed when the text gains focus (onFocus event).
     */
    onFocus: proptypes.func,

    /**
     * Callback to be executed when a key is pressed (onKeyUp event).
     */
    onKeyUp: proptypes.func,

    /**
     * Placeholder for the input field.
     */
    placeholder: proptypes.string,

    /**
     * Whether the field is required.
     *
     * **NOTE:** This prop is automatically passed down by `<Label/>`.       
     */
    readonly: proptypes.bool,

    /**
     * Whether the field is required.
     *
     * **NOTE:** This prop is automatically passed down by `<Label/>`.       
     */
    required: proptypes.bool,

    /**
     * Current value of the input field.
     */
    value: proptypes.string
  }

  static defaultProps = {
    inLabel: false,
    multiline: false,
    readonly: false
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
    const {
      className,
      format,
      readonly,
      value
    } = this.props
    const {pickerVisible} = this.state

    let dateObj = null

    if (value) {
      const dateTimeObj = new DateTime(value)

      if (dateTimeObj.isValid()) {
        dateObj = dateTimeObj
      }
    }

    const containerStyle = new Style(styles, 'container')

    containerStyle.addResolved(className)

    return (
      <div class={containerStyle.getClasses()}>
        <TextInput
          onBlur={this.handleFocus.bind(this, false)}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this, true)}
          readonly={readonly}
          type="text"
          value={dateObj && dateObj.format(format)}
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
      </div>
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
      format,
      onChange,
      value
    } = this.props
    const newDate = new DateTime(event.target.value, format)

    let newValue = null

    if (event.target.value.length > 0) {
      if (newDate.isValid()) {
        newValue = newDate.getDate().toISOString()
      } else {
        newValue = value
      }
    }

    if (typeof onChange === 'function') {
      onChange.call(this, newValue)
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
      onChange.call(this, newDate.toISOString())
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
