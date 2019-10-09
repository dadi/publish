import {Button} from '@dadi/edit-ui'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Notification.css'
import {Done, Error, Warning} from '@material-ui/icons'

/**
 * A notification strip, anchored to the bottom of the screen.
 */
export default class Notification extends React.Component {
  static propTypes = {
    /**
     * Colour accent.
     */
    accent: proptypes.oneOf(['info', 'negative', 'positive']),

    /**
     * The notification message.
     */
    message: proptypes.string,

    /**
     * A callback function to be fired when the user hovers over the
     * notification message. This will only be triggered if there are
     * no `options` specified.
     */
    onHover: proptypes.func,

    /**
     * A callback function to be fired when one of the options is clicked.
     * The callback attached to the respective option will be sent as an
     * argument of this function.
     */
    onOptionClick: proptypes.func,

    /**
     * An optional set of options to include as call-to-action in the
     * notification. The keys define the labels and the values define what
     * happens when the option is clicked. If defined as a function, it's
     * executed as a callback when the option is clicked (the option will be
     * rendered as a `<button>`). If defined as a string, it represents a link
     * to be followed when the option is clicked (the option is rendered as a
     * `<a>`).
     */
    options: proptypes.object,

    /**
     * Whether the notification is currently visible.
     */
    visible: proptypes.bool
  }

  static defaultProps = {
    accent: 'info',
    visible: true
  }

  constructor(props) {
    super(props)

    this.handleOnHover = this.handleOnHover.bind(this)
  }

  handleOnHover() {
    const {onHover, options} = this.props

    if (typeof onHover === 'function' && !Object.keys(options).length) {
      onHover()
    }
  }

  render() {
    const {accent, faded, message, onOptionClick, options, visible} = this.props
    const containerStyle = new Style(styles, 'container').addIf(
      'container-visible',
      visible
    )
    const notificationStyle = new Style(styles, 'notification')
      .add(`notification-${accent}`)
      .addIf('notification-faded', faded)

    if (
      typeof message !== 'string' ||
      (typeof options !== 'undefined' && typeof onOptionClick !== 'function')
    ) {
      return null
    }

    const hasOptions = Boolean(options && Object.keys(options).length > 0)

    return (
      <div className={containerStyle.getClasses()}>
        <div
          className={notificationStyle.getClasses()}
          onMouseEnter={this.handleOnHover}
        >
          <div className={styles.message}>
            {this.renderIcon()}

            <span>{message}</span>
          </div>

          {hasOptions && (
            <div className={styles.actions}>
              {Object.keys(options).map(label => (
                <Button
                  accent="info"
                  fillStyle="inverted"
                  href={
                    typeof options[label] === 'string' ? options[label] : null
                  }
                  key={label}
                  narrow
                  onClick={onOptionClick.bind(this, options[label])}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  renderIcon() {
    const {accent} = this.props

    switch (accent) {
      case 'info':
        return <Warning />

      case 'negative':
        return <Error />

      case 'positive':
        return <Done />
    }

    return null
  }
}
