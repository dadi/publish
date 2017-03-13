'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Button.css'

/**
 * A simple call-to-action button.
 */
export default class Button extends Component {
  static propTypes = {
    /**
     * Colour accent.
     */
    accent: proptypes.oneOf([
      'data',
      'destruct',
      'inherit',
      'neutral',
      'save',
      'system'
    ]),

    /**
     * Classes to append to the button element.
     */
    className: proptypes.string,

    /**
     * Whether the button is disabled.
     */
    disabled: proptypes.bool,

    /**
     * Whether the button is part of a group of buttons, and which position this particular button takes in the group. This is used to collapse the border-radius accordingly.
     */
    inGroup: proptypes.oneOf(['left', 'middle', 'right']),

    /**
     * Callback to be executed when the button is clicked.
     */
    onClick: proptypes.func,

    /**
     * Type/function of the button
     */
    type: proptypes.oneOf(['button', 'submit']),

    /**
     * The text to be rendered inside the button.
     */
    children: proptypes.node
  }

  static defaultProps = {
    accent: 'neutral',
    className: '',
    disabled: false,
    type: 'button'
  }

  constructor(props) {
    super(props)

    this.optionsExpanded = false
  }

  render() {
    const {
      accent, 
      className, 
      children, 
      disabled, 
      inGroup, 
      onClick, 
      type
    } = this.props

    let buttonClass = new Style(styles, 'button')

    buttonClass.add(`button-${accent}`)
      .add(`button-in-group-${inGroup}`)
      .addResolved(className)

    return (
      <button type="button"
        class={buttonClass.getClasses()}
        disabled={disabled}
        onClick={onClick}
        type={type}
      >{children}</button>
    )
  }
}
