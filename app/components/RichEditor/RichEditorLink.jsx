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
      offsetRight: 0
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

  handlePopupRef(element) {
    const {bounds} = this.props

    if (!bounds || !element || this.hasAdjustedPosition) {
      return
    }

    const {right, top} = element.getBoundingClientRect()
    const offsetRight = right - bounds.right
    const offsetTop = top - bounds.top - element.clientHeight * 2.5

    this.hasAdjustedPosition = true

    if (offsetRight > 0 || offsetTop < 0) {
      this.setState({
        offsetRight: Math.max(offsetRight, 0),
        offsetTop: Math.abs(Math.min(offsetTop, 0))
      })
    }
  }

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
    const {editing, href, offsetRight, offsetTop} = this.state

    return (
      <span className={styles.container} ref={el => (this.container = el)}>
        <a href={href} onClick={this.handleLinkClick.bind(this)}>
          {children}
        </a>

        {editing && (
          <div
            className={styles.popup}
            contentEditable={false}
            ref={this.handlePopupRef.bind(this)}
            style={{
              transform: `translate3d(-${offsetRight}px, ${offsetTop}px, 0)`
            }}
          >
            <form className={styles.form} onSubmit={this.handleSave.bind(this)}>
              <input
                autoFocus
                className={styles.input}
                onChange={this.handleLinkUpdate.bind(this)}
                type='text'
                value={href}
              />

              <button className={styles.button} type='submit'>
                Save
              </button>
            </form>
          </div>
        )}
      </span>
    )
  }
}
