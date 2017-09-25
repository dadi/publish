'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ButtonWithPrompt.css'

import Button from 'components/Button/Button'
import Prompt from 'components/Prompt/Prompt'

/**
 * A simple call-to-action button with a prompt message. This component hijacks
 * the `onClick` prop of the button and fires it only when the user confirms
 * the action within the prompt.
 */
export default class ButtonWithPrompt extends Component {
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
    
    this.state.visible = false

    this.promptRef = null
    this.promptInsideClickHandler = this.handlePromptClick.bind(this, true)
    this.promptOutsideClickHandler = this.handlePromptClick.bind(this, false)
  }

  componentDidMount() {
    window.addEventListener('click', this.promptOutsideClickHandler)
  }

  render() {
    const {
      position,
      promptCallToAction,
      promptMessage
    } = this.props
    const {visible} = this.state
    const hijackedOnClick = this.props.onClick

    let buttonProps = Object.assign({}, this.props, {
      onClick: this.handleClickHijack.bind(this)
    })

    delete buttonProps.promptCallToAction
    delete buttonProps.promptMessage

    const promptStyle = new Style(styles, 'prompt')
      .add(`prompt-${position}`)
    
    return (
      <div
        class={styles.container}
        ref={this.handlePromptRef.bind(this)}
      >
        <Button {...buttonProps}>{this.props.children}</Button>
        
        {visible &&
          <Prompt
            action={promptCallToAction}
            className={promptStyle.getClasses()}
            onClick={hijackedOnClick}
            position={position}
          >{promptMessage}</Prompt>
        }
      </div>
    )
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.promptOutsideClickHandler)

    if (this.promptRef) {
      this.promptRef.removeEventListener('click', this.promptInsideClickHandler)
    }
  }

  handleClickHijack() {
    const {visible} = this.state

    this.setState({
      visible: !visible
    })
  }

  handlePromptClick(insidePrompt, event) {
    const {visible} = this.state

    if (insidePrompt) {
      event.stopPropagation()
    } else if (visible) {
      this.setState({
        visible: false
      })
    }
  }

  handlePromptRef(element) {
    if (!element) return

    if (!this.promptRef) {
      this.promptRef = element

      element.addEventListener('click', this.promptInsideClickHandler)
    }
  }
}
