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
     * Callback to be executed when the text is changed (onChange event).
     */
    onChange: proptypes.func,

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
     * Current value of the input field.
     */
    value: proptypes.string
  }

  static defaultProps = {
    inLabel: false,
    multiline: false,
    type: 'text'
  }

  constructor(props) {
    super(props)

    this.state.value = props.value || ''
  }

  render() {
    const {
      id,
      inLabel,
      placeholder,
      required,
      type,
      value
    } = this.props

    let inputStyle = new Style(styles, 'input')

    inputStyle.addIf('input-in-label', inLabel)

    // If type is `multiline`, we render a `<textarea>`
    if (type === 'multiline') {
      return (
        <textarea
          class={inputStyle.getClasses()}
          id={id}
          placeholder={placeholder}
          required={required}
          rows={10}
          onChange={this.handleChange.bind(this)}
          onKeyUp={this.handleChange.bind(this)}
        >
          {value}
        </textarea>
      )
    }

    // Otherwise, we render an `<input>`
    return (
      <input
        class={inputStyle.getClasses()}
        type={type}
        value={value}
        id={id}
        placeholder={placeholder}
        required={required}
        onChange={this.handleChange.bind(this)}
        onKeyUp={this.handleChange.bind(this)}
      />
    )
  }

  handleChange(event) {
    const {onChange, onKeyUp} = this.props

    if (event.type === 'change' && typeof onChange === 'function') {
      onChange.call(this, event)
    }

    if (event.type === 'keyup' && typeof onKeyUp === 'function') {
      onKeyUp.call(this, event)
    }

    return true
  }
}
