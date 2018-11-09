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
     * The text/elements to be rendered inside the button.
     */
    children: proptypes.node,

    /**
     * Classes to append to the button element.
     */
    className: proptypes.string,

    /**
     * Whether the button is disabled.
     */
    disabled: proptypes.bool,

    /**
     * When present, renders the button as a `<label>` with the `for` attribute
     * linked to the given ID.
     */
    forId: proptypes.string,

    /**
     * When present, the button will be rendered as an `a` element with the given
     * href.
     */
    href: proptypes.string,

    /**
     * Whether the button is part of a group of buttons, and which position this particular button takes in the group. This is used to collapse the border-radius accordingly.
     */
    inGroup: proptypes.oneOf(['left', 'middle', 'right']),

    /**
     * Whether to display a loading state.
     */
    isLoading: proptypes.bool,

    /**
     * Callback to be executed when the button is clicked.
     */
    onClick: proptypes.func,

    /**
     * The size variation of the button.
     */
    size: proptypes.oneOf(['normal', 'small']),

    /**
     * Type/function of the button. When set to `mock`, a static element will be
     * rendered (as a `span`).
     */
    type: proptypes.oneOf(['button', 'mock', 'mock-stateful', 'submit'])
  }

  static defaultProps = {
    accent: 'neutral',
    className: '',
    disabled: false,
    inGroup: null,
    size: 'normal',
    type: 'button'
  }

  render() {
    const {
      accent, 
      className, 
      children, 
      disabled,
      forId,
      href,
      inGroup,
      isLoading,
      onClick,
      size,
      type
    } = this.props
    const buttonStyle = new Style(styles, 'button')

    buttonStyle.add(`button-${accent}`)
      .addIf('button-loading', isLoading)
      .addIf(`button-in-group-${inGroup}`, inGroup)
      .addIf('button-mock', type === 'mock')
      .addIf(`button-${size}`, size !== 'normal')
      .addIf('button-fill', type === 'fill')
      .addResolved(className)

    if (forId) {
      return (
        <label
          class={buttonStyle.getClasses()}
          for={forId}
        >{children}</label>
      )
    }

    if (type === 'mock' || type === 'mock-stateful') {
      return (
        <span class={buttonStyle.getClasses()}>{children}</span>
      )
    }

    if (href) {
      return (
        <a
          class={buttonStyle.getClasses()}
          href={href}
        >{children}</a>
      )
    }

    return (
      <button
        class={buttonStyle.getClasses()}
        disabled={disabled || isLoading}
        onClick={onClick}
        type={type}
      >{children}</button>
    )
  }
}
