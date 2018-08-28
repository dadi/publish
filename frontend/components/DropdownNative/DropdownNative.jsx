'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DropdownNative.css'

/**
 * A list of grouped links.
 */
export default class DropdownNative extends Component {
  static propTypes = {
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
     * The key of the currently selected value.
     */
    value: proptypes.string
  }

  render() {
    const {onChange, options, value} = this.props

    let dropdown = new Style(styles, 'dropdown')
    let wrapper = new Style(styles, 'wrapper')

    return (
      <div class={wrapper.getClasses()}>
        <select
          class={dropdown.getClasses()}
          onChange={e => onChange(e.target.value)}
          value={value}
        >
          {Object.keys(options).map(key => (
            <option
              key={key}
              value={key}
            >{options[key]}</option>
          ))}
        </select>
      </div>
    )
  }
}
