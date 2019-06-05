import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './ButtonWithPrompt.css'

import Button from 'components/Button/Button'
import Prompt from 'components/Prompt/Prompt'

/**
 * A simple call-to-action button with a prompt message. This component hijacks
 * the `onClick` prop of the button and fires it only when the user confirms
 * the action within the prompt.
 */
export default class ButtonWithPrompt extends React.Component {
  static propTypes = {
    /**
     * The position of the prompt relative to the button.
     */
    position: proptypes.oneOf([
      'left',
      'right'
    ]),

    /**
     * The text to be displayed in the call-to-action button.
     */
    promptCallToAction: proptypes.string,

    /**
     * The prompt message.
     */
    promptMessage: proptypes.string
  }

  static defaultProps = {
    position: 'right'
  }

  constructor(props) {
    super(props)
    
    this.state = {
      visible: false
    }

    this.clickHandler = this.handleClick.bind(this)
  }

  componentDidMount() {
    window.addEventListener('mousedown', this.clickHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.clickHandler)
  }

  handleClick(event) {
    if (
      this.containerEl &&
      !this.containerEl.contains(event.target) &&
      this.state.visible
    ) {
      this.setState({
        visible: false
      })
    }
  }

  handleClickHijack() {
    const {visible} = this.state

    this.setState({
      visible: !visible
    })
  }

  render() {
    const {
      children,
      onClick,
      position,
      promptCallToAction,
      promptMessage
    } = this.props
    const {visible} = this.state

    // This method augments the original `onClick` callback with a `setState`
    // call that closes the prompt after the action has been triggered.
    const modifiedOnClick = () => {
      this.setState({
        visible: false
      })

      onClick.apply(onClick)
    }

    // We pass all the props down to the main <Button>, but we replace
    // the `onClick` prop with our hijacking function and remove the
    // props that are specific to the prompt.
    const buttonProps = {
      ...this.props,
      onClick: this.handleClickHijack.bind(this)
    }

    delete buttonProps.promptCallToAction
    delete buttonProps.promptMessage

    const promptStyle = new Style(styles, 'prompt')
      .add(`prompt-${position}`)
    
    return (
      <div
        className={styles.container}
        ref={el => this.containerEl = el}
      >
        <Button {...buttonProps}>{children}</Button>
        
        {visible &&
          <Prompt
            action={promptCallToAction}
            className={promptStyle.getClasses()}
            onClick={modifiedOnClick}
            position={position}
          >{promptMessage}</Prompt>
        }
      </div>
    )
  }
}
