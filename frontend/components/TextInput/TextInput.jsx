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
     * full | content | static
     * 
     * full: screen height
     * content: adapts to content
     * static: use rows prop
     */
    heightType: proptypes.string,

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
     * Callback to be executed when the input is changed in any way.
     */
    onInput: proptypes.func,

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
    readonly: false,
    resizable: false,
    rows: 10,
    type: 'text'
  }

  constructor(props) {
    super(props)

    this.state.value = props.value || ''
  }

  componentDidMount() {
    this.adjustHeightIfNeeded()
  }

  render() {
    const {
      className,
      heightType,
      id,
      inLabel,
      placeholder,
      readonly,
      required,
      resizable,
      rows,
      type,
      value
    } = this.props

    let inputStyle = new Style(styles, 'input')

    inputStyle.addIf('input-in-label', inLabel)
    inputStyle.add(resizable ? 'resizable' : 'not-resizable')
    if (heightType === 'full') {
      inputStyle.add('full-height')
    } else if (heightType === 'content') {
      inputStyle.add('content-height')
    }
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
          onInput={this.handleChange.bind(this)}
          placeholder={placeholder}
          readonly={readonly}
          required={required}
          rows={heightType === 'static' ? rows : '1'}
          value={value}
        />
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
        onInput={this.handleChange.bind(this)}
        placeholder={placeholder}
        readonly={readonly}
        required={required}
        type={type}
        value={value}
      />
    )
  }

  adjustHeightIfNeeded()
  {
    if (this.props.heightType === 'content') {
      this.base.style.height = 'auto'
      this.base.style.height = this.base.scrollHeight + 'px'
    }
  }

  handleChange(event) {
    const {onChange, onInput, onKeyUp} = this.props

    this.adjustHeightIfNeeded()

    if (event.type === 'change' && typeof onChange === 'function') {
      onChange.call(this, event)
    }

    if (event.type === 'input' && typeof onInput === 'function') {
      onInput.call(this, event)
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
