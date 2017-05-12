'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './TextInput.css'

/**
 * A text input field.
 */
export default class TextInput extends Component {
  static propTypes = {
    /**
     * Classes to append to the button element.
     */
    className: proptypes.string,

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
     * Callback to be executed onChange to validate field value.
     */
    validation: proptypes.func,

    /**
     * Current value of the input field.
     */
    value: proptypes.string
  }

  static defaultProps = {
    inLabel: false,
    multiline: false,
    readonly: false,
    type: 'text'
  }

  constructor(props) {
    super(props)

    this.state.value = props.value || ''
  }

  render() {
    const {
      className,
      id,
      inLabel,
      placeholder,
      readonly,
      required,
      type,
      value
    } = this.props

    let inputStyle = new Style(styles, 'input')

    inputStyle.addIf('input-in-label', inLabel)
    inputStyle.addResolved(className)

    // If type is `multiline`, we render a `<textarea>`
    if (type === 'multiline') {
      return (
        <textarea
          class={inputStyle.getClasses()}
          id={id}
          onBlur={this.handleEvent.bind(this, 'onBlur')}
          onChange={this.handleChange.bind(this)}
          onFocus={this.handleEvent.bind(this, 'onFocus')}
          onKeyUp={this.handleChange.bind(this)}
          placeholder={placeholder}
          readonly={readonly}
          required={required}
          rows={10}
        >
          {value}
        </textarea>
      )
    }

    // Otherwise, we render an `<input>`
    return (
      <input
        class={inputStyle.getClasses()}
        id={id}
        onBlur={this.handleEvent.bind(this, 'onBlur')}
        onChange={this.handleChange.bind(this)}
        onFocus={this.handleEvent.bind(this, 'onFocus')}
        onKeyUp={this.handleChange.bind(this)}
        placeholder={placeholder}
        readonly={readonly}
        required={required}
        type={type}
        value={value}
      />
    )
  }

  handleChange(event) {
    const {onChange, onKeyUp, validation} = this.props

    // Attach validation outcome to event.
    event.isValid = validation? validation(event.target.value): true

    if (event.type === 'change' && typeof onChange === 'function') {
      onChange.call(this, event)
    }

    if (event.type === 'keyup' && typeof onKeyUp === 'function') {
      onKeyUp.call(this, event)
    }

    return true
  }

  handleEvent(callback, event) {
    if (typeof this.props[callback] === 'function') {
      this.props[callback].call(this, event)
    }
  }
}
