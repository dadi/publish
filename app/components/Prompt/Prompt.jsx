import {Button} from '@dadi/edit-ui'
import HotKeys from 'lib/hot-keys'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Prompt.css'

/**
 * A prompt dialog with a message and action button.
 */
export default class Prompt extends React.Component {
  static propTypes = {
    /**
     * Colour accent.
     */
    accent: proptypes.oneOf(['negative', 'positive']),

    /**
     * The text to be displayed on the action button
     */
    action: proptypes.string.isRequired,

    /**
     * Whether to accept the Enter key as confirmation.
     */
    confirmOnEnterKey: proptypes.bool,

    /**
     * The child elements to be rendered next to the message.
     */
    children: proptypes.node,

    /**
     * Classes to append to the container element.
     */
    className: proptypes.string,

    /**
     * Callback to be executed when the cancel button is clicked.
     */
    onCancel: proptypes.func,

    /**
     * Callback to be executed when the confirmation button is clicked.
     */
    onConfirm: proptypes.func
  }

  static defaultProps = {
    accent: 'negative',
    confirmOnEnterKey: true
  }

  constructor(props) {
    super(props)

    this.hotkeys = new HotKeys({})

    if (props.confirmOnEnterKey && typeof props.onConfirm === 'function') {
      this.hotkeys.on('enter', props.onConfirm)
    }
  }

  componentDidMount() {
    this.hotkeys.addListener()
  }

  componentWillUnmount() {
    this.hotkeys.removeListener()
  }

  render() {
    const {
      accent,
      action,
      children,
      className,
      onCancel,
      onConfirm
    } = this.props
    const promptStyle = new Style(styles, 'container').addResolved(className)

    return (
      <div className={promptStyle.getClasses()}>
        <div className={styles.message}>{children}</div>

        <div className={styles.action}>
          <Button accent="negative" onClick={onCancel}>
            Cancel
          </Button>

          <Button accent={accent} filled onClick={onConfirm}>
            {action}
          </Button>
        </div>
      </div>
    )
  }
}
