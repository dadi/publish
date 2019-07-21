import proptypes from 'prop-types'
import React from 'react'

import Style from 'lib/Style'
import styles from './TextInput.css'

/**
 * A text input field.
 */
export default class TextInput extends React.Component {
  static propTypes = {
    /**
     * Whether to add focus to the input element automatically when mounting
     * the component.
     */
    autoFocus: proptypes.bool,

    /**
     * Classes to append to the input element.
     */
    className: proptypes.string,

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
     * Ref callback which takes the input DOM element as a parameter.
     */
    inputRef: proptypes.func,

    /**
     * full | content | static
     *
     * full: screen height
     * content: adapts to content
     * static: use rows prop
     */
    heightType: proptypes.string,

    /**
     * DOM name for the input field.
     */
    name: proptypes.string,

    /**
     * Turns off autocomplete for this field.
     */
    noAutoComplete: proptypes.bool,

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
     * Callback to be executed when the input is changed in any way.
     */
    onInput: proptypes.func,

    /**
     * Callback to be executed when any key is pressed in the input.
     */
    onKeyDown: proptypes.func,

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
     * Whether the field is resizable
     */
    resizable: proptypes.bool,

    /**
     * Number of rows, if the heightType is set to `static`.
     */
    rows: proptypes.number,

    /**
     * Type/function of the input field.
     */
    type: proptypes.oneOf([
      'email',
      'multiline',
      'number',
      'password',
      'tel',
      'text',
      'url'
    ]),

    /**
     * Current value of the input field.
     */
    value: proptypes.string
  }

  static defaultProps = {
    heightType: 'static',
    inLabel: false,
    multiline: false,
    readOnly: false,
    resizable: false,
    rows: 10,
    type: 'text'
  }

  constructor(props) {
    super(props)

    this.base = null
    this.cursor = null

    this.state = {
      value: props.value || ''
    }
  }

  adjustHeightIfNeeded() {
    const {heightType} = this.props

    if (heightType === 'content') {
      this.base.style.height = 'auto'
      this.base.style.height = this.base.scrollHeight + 'px'
    }
  }

  componentDidMount() {
    this.adjustHeightIfNeeded()

    const {inputRef} = this.props

    if (typeof inputRef === 'function') {
      inputRef(this.base)
    }
  }

  componentDidUpdate(oldProps) {
    const {heightType: oldHeightType, value: oldValue} = oldProps
    const {heightType, inputRef, value} = this.props

    if (oldHeightType !== heightType && heightType === 'content') {
      this.adjustHeightIfNeeded()
    }

    if (oldValue !== value && this.cursor) {
      this.setCursor(this.cursor)
    }

    if (typeof inputRef === 'function') {
      inputRef(this.base)
    }
  }

  handleChange(type, event) {
    const {onChange, onInput} = this.props
    const {selectionStart, selectionEnd} = this.base

    this.cursor = [selectionStart, selectionEnd]
    this.adjustHeightIfNeeded()

    if (type === 'onChange' && typeof onChange === 'function') {
      onChange(event)
    }

    if (type === 'onInput' && typeof onInput === 'function') {
      onInput(event)
    }

    return true
  }

  handleEvent(callback, event) {
    if (typeof this.props[callback] === 'function') {
      this.props[callback](event)
    }
  }

  render() {
    const {
      autoFocus,
      className,
      heightType,
      id,
      inLabel,
      name,
      noAutoComplete,
      placeholder,
      readOnly,
      required,
      resizable,
      rows,
      type,
      value
    } = this.props

    const inputStyle = new Style(styles, 'input')

    inputStyle.addIf('input-in-label', inLabel)
    inputStyle.add(resizable ? 'resizable' : 'not-resizable')
    inputStyle.addResolved(className)

    if (heightType === 'full') {
      inputStyle.add('full-height')
    } else if (heightType === 'content') {
      inputStyle.add('content-height')
    }

    // If type is `multiline`, we render a `<textarea>`
    if (type === 'multiline') {
      return (
        <textarea
          autoFocus={autoFocus}
          className={inputStyle.getClasses()}
          id={id}
          name={name}
          onBlur={this.handleEvent.bind(this, 'onBlur')}
          onChange={this.handleChange.bind(this, 'onChange')}
          onFocus={this.handleEvent.bind(this, 'onFocus')}
          onInput={this.handleChange.bind(this, 'onInput')}
          onKeyDown={this.handleEvent.bind(this, 'onKeyDown')}
          placeholder={placeholder}
          readOnly={readOnly}
          ref={el => (this.base = el)}
          required={required}
          rows={heightType === 'content' ? '1' : rows}
          value={value || ''}
        />
      )
    }

    // Otherwise, we render an `<input>`
    return (
      <input
        autoComplete={noAutoComplete && 'off'}
        autoFocus={autoFocus}
        className={inputStyle.getClasses()}
        id={id}
        name={name}
        onBlur={this.handleEvent.bind(this, 'onBlur')}
        onChange={this.handleChange.bind(this, 'onChange')}
        onFocus={this.handleEvent.bind(this, 'onFocus')}
        onInput={this.handleChange.bind(this, 'onInput')}
        onKeyDown={this.handleEvent.bind(this, 'onKeyDown')}
        placeholder={placeholder}
        readOnly={readOnly}
        ref={el => (this.base = el)}
        required={required}
        type={type}
        value={value || ''}
      />
    )
  }

  setCursor(selectionRange) {
    try {
      this.base.setSelectionRange(...selectionRange)
    } catch {
      // setSelectionRange not supported for this type of input.
    }
  }
}
