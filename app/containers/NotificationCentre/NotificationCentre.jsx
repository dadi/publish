import * as appActions from 'actions/appActions'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import Notification from 'components/Notification/Notification'
import proptypes from 'prop-types'
import React from 'react'

/**
 * A global notification centre.
 */
class NotificationCentre extends React.Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.enqueuedNotification = null
    this.timeout = null

    this.state = {
      faded: false,
      visible: false
    }
  }

  componentDidUpdate(prevProps) {
    const prevNotification = prevProps.state.app.notification
    const notification = this.props.state.app.notification

    if (!prevNotification && notification) {
      this.start()
    }

    if (
      prevNotification &&
      notification &&
      prevNotification.timestamp !== notification.timestamp
    ) {
      setTimeout(() => {
        this.enqueuedNotification = null

        this.start()
      }, 300)
    }
  }

  componentWillReceiveProps(nextProps) {
    const notification = this.props.state.app.notification
    const nextNotification = nextProps.state.app.notification
    const currentRoute = this.props.route.path
    const nextRoute = nextProps.route.path

    if (
      notification &&
      nextNotification &&
      notification.timestamp !== nextNotification.timestamp
    ) {
      this.enqueuedNotification = notification

      return this.dismiss()
    }

    if (
      notification &&
      notification.dismissAfterRouteChange &&
      currentRoute !== nextRoute
    ) {
      return this.dismiss()
    }
  }

  dismiss() {
    clearTimeout(this.timeout)

    this.setState({
      faded: false,
      visible: false
    })
  }

  fade() {
    this.setState({
      faded: true
    })
  }

  handleOnHover() {
    const {state} = this.props
    const notification = state.app.notification
    const {dismissOnHover} = notification

    if (dismissOnHover) {
      this.dismiss()
    }
  }

  handleOptionClick(callback) {
    if (typeof callback === 'function') {
      callback()
    }

    this.dismiss()
  }

  render() {
    const {state} = this.props
    const {faded, visible} = this.state
    const notification = this.enqueuedNotification || state.app.notification

    if (!notification) return null

    const {message, options} = notification

    return (
      <Notification
        faded={faded}
        message={message}
        onHover={this.handleOnHover.bind(this)}
        onOptionClick={this.handleOptionClick.bind(this)}
        options={options}
        visible={visible}
      />
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    const notification = this.props.state.app.notification
    const nextNotification = nextProps.state.app.notification

    if (this.state.faded !== nextState.faded) {
      return true
    }

    if (this.state.visible !== nextState.visible) {
      return true
    }

    if (
      notification &&
      nextNotification &&
      notification.timestamp === nextNotification.timestamp
    ) {
      return false
    }

    return true
  }

  start() {
    const notification = this.props.state.app.notification
    const {dismissAfterSeconds, fadeAfterSeconds} = notification

    clearTimeout(this.timeout)

    if (dismissAfterSeconds) {
      setTimeout(this.dismiss.bind(this), dismissAfterSeconds * 1000)
    }

    if (fadeAfterSeconds) {
      setTimeout(this.fade.bind(this), fadeAfterSeconds * 1000)
    }

    setTimeout(() => {
      this.setState({
        faded: false,
        visible: true
      })
    }, 10)
  }
}

export default connectRouter(connectRedux(appActions)(NotificationCentre))
