import {Link} from 'react-router-dom'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Button.css'

/**
 * A simple call-to-action button.
 */
export default class Button extends React.Component {
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
     * When present, the button will be rendered as an `a` element with the
     * given href.
     */
    href: proptypes.string,

    /**
     * Whether the button is part of a group of buttons, and which position
     * this particular button takes in the group. This is used to collapse
     * the border-radius accordingly.
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
     * Whether to open a link in a new window (i.e. target="_blank"). Only
     * applicable when the prop `href` is supplied.
     */
    openInNewWindow: proptypes.bool,

    /**
     * The size variation of the button.
     */
    size: proptypes.oneOf(['normal', 'small']),

    /**
     * Type/function of the button. When set to `mock`, a static element will
     * be rendered (as a `span`).
     */
    type: proptypes.oneOf(['button', 'fill', 'mock', 'mock-stateful', 'submit'])
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
      openInNewWindow,
      size,
      type
    } = this.props
    const buttonStyle = new Style(styles, 'button')

    buttonStyle
      .add(`button-${accent}`)
      .addIf('button-disabled', disabled)
      .addIf('button-loading', isLoading)
      .addIf(`button-in-group-${inGroup}`, inGroup)
      .addIf('button-mock', type === 'mock')
      .addIf(`button-${size}`, size !== 'normal')
      .addIf('button-fill', type === 'fill')
      .addResolved(className)

    if (forId) {
      return (
        <label className={buttonStyle.getClasses()} htmlFor={forId}>
          {children}
        </label>
      )
    }

    if (type === 'mock' || type === 'mock-stateful') {
      return <span className={buttonStyle.getClasses()}>{children}</span>
    }

    if (href) {
      if (href.indexOf('/') !== 0) {
        return (
          <a
            className={buttonStyle.getClasses()}
            href={href}
            target={openInNewWindow && '_blank'}
            onClick={onClick}
          >
            {children}
          </a>
        )
      }

      return (
        <Link className={buttonStyle.getClasses()} to={href} onClick={onClick}>
          {children}
        </Link>
      )
    }

    return (
      <button
        className={buttonStyle.getClasses()}
        disabled={disabled || isLoading}
        onClick={onClick}
        type={type}
      >
        {children}
      </button>
    )
  }
}
