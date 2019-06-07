import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './TextInputWithDatePicker.css'

import DateTimePicker from 'components/DateTimePicker/DateTimePicker'
import TextInput from 'components/TextInput/TextInput'

import DateTime from 'lib/datetime'

/**
 * Component for API fields of type DateTime
 */
export default class TextInputWithDatePicker extends React.Component {
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
     * Whether the field is part of a `<Label/>` component. This makes it
     * inherit certain CSS properties from the parent.
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
     * Whether the field is read-only.
     */
    readOnly: proptypes.bool,

    /**
     * Whether the field is required.
     *
     * **NOTE:** This prop is automatically passed down by `<Label/>`.
     */
    required: proptypes.bool,

    /**
     * Current value of the input field.
     */
    value: proptypes.oneOfType([proptypes.number, proptypes.string])
  }

  static defaultProps = {
    inLabel: false,
    multiline: false,
    readOnly: false
  }

  constructor(props) {
    super(props)

    this.state = {
      pickerVisible: false
    }

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
    const {format, onChange, value} = this.props
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
    const {readOnly} = this.props
    const {pickerVisible} = this.state

    if (readOnly) return

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
      console.log('---> propagating:', {id: this.props.id, sanitisedValue})
      onChange.call(this, sanitisedValue)
    }
  }

  render() {
    const {
      containerClassName,
      format,
      inputClassName,
      placeholder,
      readOnly,
      value
    } = this.props
    const {pickerVisible} = this.state

    let dateObj = null

    if (value) {
      console.log({id: this.props.id, value})
      const dateTimeObj = new DateTime(value)

      if (dateTimeObj.isValid()) {
        dateObj = dateTimeObj
      }
    }

    const containerStyles = new Style(styles, 'container').addResolved(
      containerClassName
    )

    return (
      <div
        className={containerStyles.getClasses()}
        ref={el => (this.rootEl = el)}
      >
        <TextInput
          className={inputClassName}
          onBlur={null && this.handleFocus.bind(this, false)}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleFocus.bind(this, true)}
          placeholder={placeholder}
          readOnly={readOnly}
          type="text"
          value={dateObj && dateObj.format(format)}
        />

        {pickerVisible && (
          <DateTimePicker
            className={styles.picker}
            date={dateObj && dateObj.getDate()}
            onChange={this.handlePickerChange.bind(this)}
          />
        )}
      </div>
    )
  }
}
