import Button from 'components/Button/Button'
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
    accent: proptypes.oneOf([
      'data',
      'destruct',
      'inherit',
      'neutral',
      'save',
      'system'
    ]),

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
     * Callback to be executed when the button is clicked.
     */
    onClick: proptypes.func,

    /**
     * The position of the prompt tooltip.
     */
    position: proptypes.oneOf(['left', 'right'])
  }

  static defaultProps = {
    accent: 'destruct',
    confirmOnEnterKey: true,
    position: 'left'
  }

  constructor(props) {
    super(props)

    this.hotkeys = new HotKeys({})

    if (props.confirmOnEnterKey && typeof props.onClick === 'function') {
      this.hotkeys.on('enter', props.onClick)
    }
  }

  componentDidMount() {
    this.hotkeys.addListener()
  }

  componentWillUnmount() {
    this.hotkeys.removeListener()
  }

  render() {
    const {accent, action, children, className, onClick, position} = this.props
    const promptStyle = new Style(styles, 'container')
      .add(`container-${accent}`)
      .add(`container-${position}`)
      .addResolved(className)

    return (
      <div className={promptStyle.getClasses()}>
        {children}

        <div className={styles.action}>
          <Button accent='destruct' onClick={onClick} size='small'>
            {action}
          </Button>
        </div>
      </div>
    )
  }
}
