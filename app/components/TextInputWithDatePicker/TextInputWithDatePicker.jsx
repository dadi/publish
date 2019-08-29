import DateTime from 'lib/datetime'
import DateTimePicker from 'components/DateTimePicker/DateTimePicker'
import HotKeys from 'lib/hot-keys'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './TextInputWithDatePicker.css'
import {TextInput} from '@dadi/edit-ui'

/**
 * Component for API fields of type DateTime
 */
export default class TextInputWithDatePicker extends React.Component {
  static propTypes = {
    /**
     * A set of class names to be applied to the container element.
     */
    containerClassName: proptypes.string,

    /**
     * The preferred format as specified by the application config,
     */
    defaultFormat: proptypes.string,

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

    this.hotKeys = new HotKeys({
      enter: this.handleInputReturn.bind(this)
    })

    this.state = {
      internalValue: null,
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

  handleInputChange(event) {
    const {format, onChange} = this.props
    const {value} = event.target
    const newDate = new DateTime(event.target.value, format)

    if (value.length === format.length && newDate.isValid()) {
      if (typeof onChange === 'function') {
        const utcDate = newDate.getDate({toUTC: true})

        onChange(utcDate.getTime())
      }

      this.setState({
        internalValue: null
      })
    } else {
      if (typeof onChange === 'function') {
        onChange(null)
      }

      this.setState({
        internalValue: value
      })
    }
  }

  handleInputReturn() {
    this.setState({
      pickerVisible: false
    })
  }

  handlePickerChange(value) {
    const {format, onChange} = this.props
    const newDate = new DateTime(value, format)

    if (typeof onChange === 'function') {
      if (!newDate.isValid()) {
        onChange(null)
      }

      onChange(newDate.getDate().getTime())
    }

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

  render() {
    const {
      containerClassName,
      defaultFormat,
      format,
      inputClassName,
      placeholder,
      readOnly,
      value
    } = this.props
    const {internalValue, pickerVisible} = this.state
    const containerStyles = new Style(styles, 'container').addResolved(
      containerClassName
    )
    const showTimePicker =
      typeof format !== 'string' ||
      format.includes('HH') ||
      format.includes('mm')

    let dateObj = null

    if (value && !internalValue) {
      const dateTimeObj = new DateTime(value, format, defaultFormat)

      if (dateTimeObj.isValid()) {
        dateObj = dateTimeObj
      }
    }

    return (
      <div
        className={containerStyles.getClasses()}
        ref={el => (this.rootEl = el)}
      >
        <TextInput
          className={inputClassName}
          autoComplete="off"
          onBlur={null && this.handleFocus.bind(this, false)}
          onChange={this.handleInputChange.bind(this)}
          onKeyDown={this.hotKeys.capture(true)}
          onFocus={this.handleFocus.bind(this, true)}
          placeholder={placeholder}
          readOnly={readOnly}
          type="text"
          value={internalValue || (dateObj && dateObj.format(format))}
        />

        {pickerVisible && (
          <DateTimePicker
            className={styles.picker}
            date={dateObj && dateObj.getDate()}
            onChange={this.handlePickerChange.bind(this)}
            showTimePicker={showTimePicker}
          />
        )}
      </div>
    )
  }
}
