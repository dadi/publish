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
    accent: proptypes.oneOf(['system']),

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
    accent: 'system',
    type: 'button'
  }

  constructor(props) {
    super(props)

    this.optionsExpanded = false
  }

  render() {
    let buttonClass = new Style(styles, 'button')

    buttonClass.add(`button-${this.props.accent}`)
      .add(`button-in-group-${this.props.inGroup}`)

    return (
      <button type="button"
        class={buttonClass.getClasses()}
        onClick={this.props.onClick}
        type={this.props.type}
      >{this.props.children}</button>
    )
  }
}
