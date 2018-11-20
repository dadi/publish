'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DropdownNative.css'

/**
 * A dropdown component using the native <select> element.
 */
export default class DropdownNative extends Component {
  static propTypes = {
    /**
     * Classes to append to the button element.
     */
    className: proptypes.string,

    /**
     * Callback to be executed when an option is selected.
     */
    onChange: proptypes.func,

    /**
     * An object containing option labels as keys and the corresponding
     * handlers as values.
     */
    options: proptypes.object,

    /**
     * The label for a placeholder option.
     */
    placeholderLabel: proptypes.string,

    /**
     * The value for a placeholder option.
     */
    placeholderValue: proptypes.string,

    /**
     * The size of the text to be rendered.
     */
    textSize: proptypes.oneOf([
      'small',
      'normal'
    ]),

    /**
     * The key of the currently selected value.
     */
    value: proptypes.string
  }

  render() {
    const {
      className,
      onChange,
      options,
      placeholderLabel,
      placeholderValue,
      textSize,
      value
    } = this.props

    const dropdownStyle = new Style(styles, 'dropdown')
      .addIf(`dropdown-text-${textSize}`, textSize)
      .addResolved(className)

    return (
      <select
        class={dropdownStyle.getClasses()}
        onChange={e => onChange(e.target.value)}
        value={value}
      >
        {placeholderValue &&
          <option
            disabled
            value={placeholderValue}
          >{placeholderLabel || placeholderValue}</option>
        }

        {Object.keys(options).map(key => (
          <option
            key={key}
            value={key}
          >{options[key]}</option>
        ))}
      </select>
    )
  }
}
