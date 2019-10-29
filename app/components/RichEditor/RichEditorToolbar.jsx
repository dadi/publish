import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './RichEditorToolbar.css'

export class RichEditorToolbar extends React.Component {
  static propTypes = {
    /**
     * The contents of the toolbar.
     */
    children: proptypes.node
  }

  render() {
    const {children, isFullscreen} = this.props
    const containerStyle = new Style(styles, 'container').addIf(
      'fullscreen',
      isFullscreen
    )

    return <div className={containerStyle.getClasses()}>{children}</div>
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
    const {active, children, disabled, title} = this.props
    const buttonStyle = new Style(styles, 'button').addIf('active', active)

    return (
      <button
        className={buttonStyle.getClasses()}
        disabled={disabled}
        onMouseDown={this.handleClick.bind(this)}
        type="button"
        title={title}
      >
        {children}
      </button>
    )
  }
}
