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
     * Classes to append to the input element.
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
     * DOM name for the input field.
     */
    name: proptypes.string,

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

  componentDidUpdate(oldProps) {
    const {oldHeightType} = oldProps
    const {heightType} = this.props

    if (oldHeightType !== heightType && heightType === 'content') {
      this.adjustHeightIfNeeded()
    }
  }

  componentWillUnmount() {
    // This is a *temporary* measure to stop Preact from recycling the DOM
    // nodes of this component, which has caused issues with username/passwords
    // being autofilled in other fields. Should be removed once Preact drops
    // this feature.
    //
    // https://github.com/developit/preact/issues/957#issuecomment-352780885
    setTimeout(() => {
      this.nextBase = this.__b = null
    })
  }

  render() {
    const {
      className,
      heightType,
      id,
      inLabel,
      name,
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
          class={inputStyle.getClasses()}
          id={id}
          name={name}
          onBlur={this.handleEvent.bind(this, 'onBlur')}
          onChange={this.handleChange.bind(this, 'onChange')}
          onFocus={this.handleEvent.bind(this, 'onFocus')}
          onInput={this.handleChange.bind(this, 'onInput')}
          onKeyDown={this.handleEvent.bind(this, 'onKeyDown')}
          placeholder={placeholder}
          readonly={readonly}
          required={required}
          rows={heightType === 'content' ? '1' : rows}
          value={value}
        />
      )
    }

    // Otherwise, we render an `<input>`
    return (
      <input
        class={inputStyle.getClasses()}
        id={id}
        name={name}
        onBlur={this.handleEvent.bind(this, 'onBlur')}
        onChange={this.handleChange.bind(this, 'onChange')}
        onFocus={this.handleEvent.bind(this, 'onFocus')}
        onInput={this.handleChange.bind(this, 'onInput')}
        onKeyDown={this.handleEvent.bind(this, 'onKeyDown')}
        placeholder={placeholder}
        readonly={readonly}
        required={required}
        type={type}
        value={value}
      />
    )
  }

  adjustHeightIfNeeded() {
    if (this.props.heightType === 'content') {
      this.base.style.height = 'auto'
      this.base.style.height = this.base.scrollHeight + 'px'
    }
  }

  handleChange(type, event) {
    const {onChange, onInput} = this.props

    this.adjustHeightIfNeeded()

    if (type === 'onChange' && typeof onChange === 'function') {
      onChange.call(this, event)
    }

    if (type === 'onInput' && typeof onInput === 'function') {
      onInput.call(this, event)
    }

    return true
  }

  handleEvent(callback, event) {
    if (typeof this.props[callback] === 'function') {
      this.props[callback].call(this, event)
    }
  }
}
