import {Button, TextInput} from '@dadi/edit-ui'
import isHotkey from 'is-hotkey'
import proptypes from 'prop-types'
import React from 'react'
import styles from './RichEditorLink.css'

const isEscape = isHotkey('escape')

export default class RichEditorLink extends React.Component {
  static propTypes = {
    /**
     * The bounds of the parent container. This allows the tooltip to always
     * be rendered within view.
     */
    bounds: proptypes.shape({
      bottom: proptypes.number,
      left: proptypes.number,
      right: proptypes.number,
      top: proptypes.number
    }),

    /**
     * The contents of the link.
     */
    children: proptypes.node,

    /**
     * The link URL.
     */
    href: proptypes.string,

    /**
     * A callback to be fired when the value of the link is updated.
     */
    onChange: proptypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.detectClickOut = this.detectClickOut.bind(this)
    this.detectEscape = this.detectEscape.bind(this)
    this.focusInput = () => this.inputRef.current.focus()
    this.openPrompt = () => this.setState({editing: true})
    this.saveValue = this.saveValue.bind(this)
    this.updateValue = e => this.setState({href: e.target.value})

    this.containerRef = React.createRef()
    this.inputRef = React.createRef()
    this.linkRef = React.createRef()
    this.popupRef = React.createRef()
    this.state = {
      editing: props.href === '',
      href: props.href,
      popupStyle: {}
    }
  }

  componentDidMount() {
    document.body.addEventListener('mousedown', this.detectClickOut)

    if (this.inputRef.current) {
      setTimeout(this.focusInput, 0)
    }

    this.setPopupPosition()
  }

  componentDidUpdate() {
    this.setPopupPosition()
  }

  componentWillUnmount() {
    document.body.removeEventListener('mousedown', this.detectClickOut)
  }

  detectClickOut(event) {
    const {current} = this.containerRef

    if (this.state.editing && current && !current.contains(event.target)) {
      const {href, onChange} = this.props

      this.setState({editing: false, href})
      if (href === '') onChange('')
    }
  }

  detectEscape(event) {
    if (isEscape(event)) {
      const {href, onChange} = this.props

      this.setState({editing: false, href})
      if (href === '') onChange('')
    }
  }

  render() {
    const {editing, href, popupStyle} = this.state

    return (
      <span className={styles.container} ref={this.containerRef}>
        <a onClick={this.openPrompt} ref={this.linkRef}>
          {this.props.children}
        </a>

        {editing && (
          <div
            className={styles.popup}
            contentEditable={false}
            ref={this.popupRef}
            style={popupStyle}
          >
            <form className={styles.form} onSubmit={this.saveValue}>
              <TextInput
                autoFocus
                className={styles.input}
                onChange={this.updateValue}
                onKeyDown={this.detectEscape}
                ref={this.inputRef}
                value={href}
              />

              <Button
                accent="positive"
                className={styles.button}
                compact
                type="submit"
              >
                Save
              </Button>
            </form>
          </div>
        )}
      </span>
    )
  }

  saveValue(event) {
    event.preventDefault()
    this.setState({editing: false})
    this.props.onChange(this.state.href)
  }

  setPopupPosition() {
    const {bounds} = this.props
    const {popupStyle} = this.state

    if (!bounds || !this.popupRef.current || !this.linkRef.current) return

    const {height, width} = this.popupRef.current.getBoundingClientRect()
    const {
      bottom: linkBottom,
      left: linkLeft,
      top: linkTop
    } = this.linkRef.current.getBoundingClientRect()

    const POPUP_MARGIN = 10
    const left =
      Math.min(bounds.right - linkLeft - width - POPUP_MARGIN, 0) + 'px'
    const isEnoughSpaceBottom =
      linkBottom + POPUP_MARGIN + height < bounds.bottom
    const isEnoughSpaceTop = linkTop - POPUP_MARGIN - height > bounds.top
    const top =
      !isEnoughSpaceBottom && isEnoughSpaceTop
        ? -(height + 2 * POPUP_MARGIN) + 'px'
        : undefined

    if (popupStyle.left !== left || popupStyle.top !== top) {
      this.setState({popupStyle: {left, top}})
    }
  }
}
