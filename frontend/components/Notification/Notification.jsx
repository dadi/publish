'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Notification.css'

/**
 * A notification strip, anchored to the bottom of the screen.
 */
export default class Notification extends Component {
  static propTypes = {
    /**
     * Colour accent.
     */
    accent: proptypes.oneOf([
      'destruct',
      'save',
      'system'
    ]),

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
    accent: 'system',
    visible: true
  }

  render() {
    const {
      accent,
      message,
      onHover,
      onOptionClick,
      options,
      visible
    } = this.props
    const containerStyle = new Style(styles, 'container')
      .addIf('container-visible', visible)
    const notificationStyle = new Style(styles, 'notification')
      .add(`notification-${accent}`)

    return (
      <div class={containerStyle.getClasses()}>
        <div
          class={notificationStyle.getClasses()}
          onMouseEnter={this.handleOnHover.bind(this)}
        >
          <span>{message}</span>

          {options && Object.keys(options).map(label => {
            if (typeof options[label] === 'string') {
              return (
                <a
                  class={styles.option}
                  href={options[label]}
                  onClick={onOptionClick.bind(this, options[label])}
                >{label}</a>
              )
            }

            return (
              <button
                class={styles.option}
                onClick={onOptionClick.bind(this, options[label])}
              >{label}</button>
            )
          })}
        </div>
      </div>
    )
  }

  handleOnHover() {
    const {onHover, options} = this.props

    if (typeof onHover === 'function' && !Object.keys(options).length) {
      onHover()
    }
  }
}
