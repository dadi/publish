import {Component, h} from 'preact'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'

import * as appActions from 'actions/appActions'
import {connectHelper} from 'lib/util'

import Notification from 'components/Notification/Notification'

/**
 * A global notification centre.
 */
class NotificationCentre extends Component {
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

    this.state.visible = false
    this.timeout = null
  }

  shouldComponentUpdate(nextProps, nextState) {
    const notification = this.props.state.app.notification
    const nextNotification = nextProps.state.app.notification

    if (this.state.visible !== nextState.visible) {
      return true
    }

    if (notification && nextNotification && 
       (notification.timestamp === nextNotification.timestamp)) {
      return false
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const {state} = this.props
    const currentNotification = state.app.notification

    if (!currentNotification) return

    const nextNotification = nextProps.state.app.notification
    const currentRoute = state.router.locationBeforeTransitions.pathname
    const nextRoute = nextProps.state.router.locationBeforeTransitions.pathname

    if (currentNotification.dismissAfterRouteChange && (currentRoute !== nextRoute)) {
      this.dismiss()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const prevNotification = prevProps.state.app.notification
    const notification = this.props.state.app.notification

    if (!prevNotification && notification) {
      this.start()
    }

    if (prevNotification && notification && 
       (prevNotification.timestamp !== notification.timestamp)) {
      this.start()
    }
  }

  render() {
    const {state} = this.props
    const {visible} = this.state
    const notification = state.app.notification

    if (!notification) return null

    const {
      dismissAfterRouteChange,
      dismissAfterSeconds,
      message,
      options,
      timestamp,
      type
    } = notification

    return (
      <Notification
        message={message}
        onHover={this.handleOnHover.bind(this)}
        onOptionClick={this.handleOptionClick.bind(this)}
        options={options}
        visible={visible}
      />
    )
  }

  start() {
    const notification = this.props.state.app.notification
    const {
      dismissAfterSeconds
    } = notification

    clearTimeout(this.timeout)

    if (dismissAfterSeconds) {
      setTimeout(this.dismiss.bind(this), dismissAfterSeconds * 1000)
    }

    setTimeout(() => {
      this.setState({
        visible: true
      })
    }, 10)
  }

  dismiss() {
    this.setState({
      visible: false
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
}

export default connectHelper(
  state => ({
    app: state.app,
    router: state.router
  }),
  dispatch => bindActionCreators(appActions, dispatch)
)(NotificationCentre)
