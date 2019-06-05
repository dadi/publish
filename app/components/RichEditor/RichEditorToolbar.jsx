import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './RichEditorToolbar.css'

export class RichEditorToolbar extends React.Component {
  static propTypes = {
    /**
     * The contents of the toolbar.
     */
    children: proptypes.node,

    /**
     * Whether the button is disabled.
     */
    fullscreen: proptypes.bool,    
  }

  render() {
    const {children, fullscreen} = this.props
    const containerStyle = new Style(styles, 'container')
      .addIf('container-fullscreen', fullscreen)    

    return (
      <div className={containerStyle.getClasses()}>
        {children}
      </div>
    )
  }
}

export class RichEditorToolbarButton extends React.Component {
  static propTypes = {
    /**
     * The callback to be fired when the button is clicked.
     */
    action: proptypes.func,

    /**
     * Whether the button is active.
     */
    active: proptypes.bool,
    
    /**
     * Whether the button is disabled.
     */
    disabled: proptypes.bool,

    /**
     * The icon of the button (takes precedence over `text`).
     */
    icon: proptypes.string,

    /**
     * The text of the button.
     */
    text: proptypes.string
  }

  handleClick(event) {
    const {action} = this.props

    event.preventDefault()

    action.call(this, event)
  }

  render() {
    const {active, disabled, icon, text} = this.props
    const buttonStyle = new Style(styles, 'button')
      .addIf('button-active', active)
      .addIf('button-icon', icon)
    const inlineStyle = icon
      ? {backgroundImage: `url(${icon})`}
      : null

    return (
      <button
        className={buttonStyle.getClasses()}
        disabled={disabled}
        onMouseDown={this.handleClick.bind(this)}
        style={inlineStyle}
        type="button"
      >
        {!icon && text}
      </button>
    )
  }
}
