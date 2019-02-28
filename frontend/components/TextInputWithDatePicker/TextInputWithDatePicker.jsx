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
     * Classes to append to the input element.
     */
    inputClassName: proptypes.string,

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

    this.pickerClickHandler = this.handlePickerClick.bind(this)
    this.losingFocusTimeout = null
  }

  componentDidMount() {
    window.addEventListener('click', this.pickerClickHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.pickerClickHandler)

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
        newValue = newDate.getDate().getTime()
      } else {
        newValue = value
      }
    }

    this.propagateChange(newValue)

    if (typeof onChange === 'function') {
      onChange.call(this, newValue)
    }
  }

  handleFocus(hasFocus) {
    const {pickerVisible} = this.state

    if (!pickerVisible) {
      this.setState({
        pickerVisible: true
      })
    } else if (!hasFocus) {
      clearTimeout(this.losingFocusTimeout)

      this.losingFocusTimeout = setTimeout(() => {
        this.setState({
          pickerVisible: false
        })
      }, 200)
    }
  }

  handlePickerChange(newDate) {
    this.propagateChange(newDate)

    setTimeout(() => {
      this.setState({
        pickerVisible: false
      })
    }, 200)
  }

  handlePickerClick(event) {
    const {pickerVisible} = this.state
    const isInsidePicker = this.rootEl.contains(event.target)

    if (isInsidePicker) {
      clearTimeout(this.losingFocusTimeout)
    } else if (pickerVisible) {
      this.setState({
        pickerVisible: false
      })
    }
  }

  propagateChange(value) {
    const {format, onChange} = this.props
    const newDate = new DateTime(value, format)
    const sanitisedValue = newDate.isValid()
      ? newDate.getDate().getTime()
      : null

    if (typeof onChange === 'function') {
      onChange.call(this, sanitisedValue)
    }
  }

  render() {
    const {
      containerClassName,
      format,
      inputClassName,
      placeholder,
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

    const containerStyles = new Style(styles, 'container')
      .addResolved(containerClassName)

    return (
      <div
        class={containerStyles.getClasses()}
        ref={el => this.rootEl = el}
      >
        <TextInput
          className={inputClassName}
          onBlur={null && this.handleFocus.bind(this, false)}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this, true)}
          placeholder={placeholder}
          readonly={readonly}
          type="text"
          value={dateObj && dateObj.format(format)}
        />
        
        {pickerVisible &&
          <DateTimePicker
            className={styles.picker}
            date={dateObj && dateObj.getDate()}
            onChange={this.handlePickerChange.bind(this)}
          />
        }
      </div>
    )
  }
}
