'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Toolbar.css'

import TextInput from 'components/TextInput/TextInput'

/**
 * A toolbar that sits fixed at the bottom of the screen. Each immediate
 * child is seen as a group, and groups are horizontally distributed across
 * the width of the page.
 */
export default class ToolbarTextInput extends Component {
  static propTypes = {
    /**
     * Classes to append to the button element.
     */
    className: proptypes.string,

    /**
     * A callback to be executed when the value of the text input changes.
     */
    onChange: proptypes.func,

    /**
     * The placeholder to be rendered on the text input.
     */
    placeholder: proptypes.string
  }

  render() {
    const {className, onChange, placeholder} = this.props
    const inputStyle = new Style(styles, 'input')

    inputStyle.addResolved(className)

    return (
      <TextInput
        className={inputStyle.getClasses()}
        onChange={onChange}
        placeholder={placeholder}
      />
    )
  }
}
