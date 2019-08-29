import {Button} from '@dadi/edit-ui'
import Prompt from 'components/Prompt/Prompt'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './ButtonWithPrompt.css'

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
    position: proptypes.oneOf(['left', 'right']),

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

    this.containerEl = React.createRef()
    this.handleClickOut = this.handleClickOut.bind(this)
    this.togglePrompt = this.togglePrompt.bind(this)

    this.state = {
      isPromptOpen: false
    }

    this.modifiedOnClick = () => {
      this.setState({isPromptOpen: false})
      props.onClick()
    }
  }

  handleClickOut(event) {
    if (
      this.containerEl.current &&
      !this.containerEl.current.contains(event.target)
    ) {
      this.setState({isPromptOpen: false})
    }
  }

  render() {
    const {
      children,
      position,
      promptCallToAction,
      promptMessage,
      ...props
    } = this.props

    const promptStyle = new Style(styles, 'prompt').add(`prompt-${position}`)

    return (
      <div className={styles.container} ref={this.containerEl}>
        <Button filled {...props} onClick={this.togglePrompt}>
          {children}
        </Button>

        {this.state.isPromptOpen && (
          <Prompt
            action={promptCallToAction}
            className={promptStyle.getClasses()}
            onClick={this.modifiedOnClick}
            position={position}
          >
            {promptMessage}
          </Prompt>
        )}
      </div>
    )
  }

  togglePrompt() {
    if (this.state.isPromptOpen) {
      window.removeEventListener('mousedown', this.handleClickOut)
      this.setState({isPromptOpen: false})
    } else {
      window.addEventListener('mousedown', this.handleClickOut)
      this.setState({isPromptOpen: true})
    }
  }
}
