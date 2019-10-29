import {Button, TextInput} from '@dadi/edit-ui'
import proptypes from 'prop-types'
import React from 'react'
import styles from './RichEditorLink.css'

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
    onChange: proptypes.func
  }

  constructor(props) {
    super(props)

    this.clickHandler = this.handleClick.bind(this)
    this.state = {
      editing: props.href === '',
      href: props.href,
      popupStyle: {}
    }
  }

  componentDidMount() {
    document.body.addEventListener('mousedown', this.clickHandler)
  }

  componentWillUnmount() {
    document.body.removeEventListener('mousedown', this.clickHandler)
  }

  handleClick(event) {
    const {href, onChange} = this.props
    const {editing} = this.state

    if (editing && this.container && !this.container.contains(event.target)) {
      this.setState({
        editing: false,
        href
      })

      if (href === '' && typeof onChange === 'function') {
        onChange(href)
      }
    }
  }

  handleLinkClick(event) {
    event.preventDefault()

    this.setState({
      editing: true
    })
  }

  handleLinkUpdate(event) {
    this.setState({
      href: event.target.value
    })
  }

  // getPopupOffset() {
  //   const {bounds} = this.props
  //   const {popupElement, container} = this

  //   if (!bounds || !popupElement || !container) {
  //     return {}
  //   }

  //   const {right} = popupElement.getBoundingClientRect()
  //   const {top: linkTop} = this.container.getBoundingClientRect()

  //   const leftOffset = Math.min(bounds.right - right, 0)
  //   const verticalOffset = -popupElement.clientHeight * 1.5
  //   const topOrBottom = bounds.top > linkTop + verticalOffset ? 'bottom' : 'top'

  //   return {left: leftOffset, [topOrBottom]: verticalOffset}
  // }

  handleSave(event) {
    event.preventDefault()

    const {onChange} = this.props
    const {href} = this.state

    if (typeof onChange === 'function') {
      onChange(href)
    }

    this.setState({
      editing: false
    })
  }

  render() {
    const {children} = this.props
    const {editing, href} = this.state
    // const popupStyle = this.getPopupOffset()

    return (
      <span
        className={styles.container}
        ref={el => {
          this.container = el
        }}
      >
        <a href={href} onClick={this.handleLinkClick.bind(this)}>
          {children}
        </a>

        {editing && (
          <div
            className={styles.popup}
            contentEditable={false}
            ref={el => {
              this.popupElement = el
            }}
            // style={popupStyle}
          >
            <form className={styles.form} onSubmit={this.handleSave.bind(this)}>
              <TextInput
                autoFocus
                className={styles.input}
                onChange={this.handleLinkUpdate.bind(this)}
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
}
