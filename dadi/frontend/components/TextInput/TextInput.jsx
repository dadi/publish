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
     * Whether the field supports multiple lines, which results in it being rendered as a `<textarea>`.
     */
    multiline: proptypes.bool,

    /**
     * Callback to be executed when the text is changed.
     */
    onChange: proptypes.func,

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

  render() {
    const {id, inLabel, onChange, placeholder, required, type, value} = this.props
    let inputStyle = new Style(styles, 'input')

    inputStyle.addIf('input-in-label', inLabel)

    return (
      <input
        class={inputStyle.getClasses()}
        type={type}
        value={value}
        id={id}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
      />
    )
  }
}
