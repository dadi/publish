import {Component, h} from 'preact'
import {Router, route} from 'preact-router'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'
import Socket from 'lib/socket'

import * as userActions from 'actions/userActions'
import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as Constants from 'lib/constants'

import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'

import DocumentCreateView from 'views/DocumentCreateView/DocumentCreateView'
import DocumentEditView from 'views/DocumentEditView/DocumentEditView'
import DocumentListView from 'views/DocumentListView/DocumentListView'
import ErrorView from 'views/ErrorView/ErrorView'
import HomeView from 'views/HomeView/HomeView'
import PasswordResetView from 'views/PasswordResetView/PasswordResetView'
import SignInView from 'views/SignInView/SignInView'
import SignOutView from 'views/SignOutView/SignOutView'
import ProfileEditView from 'views/ProfileEditView/ProfileEditView'
import View from 'views/View/View'

import {connectHelper, debounce} from 'lib/util'
import ConnectionMonitor from 'lib/status'
import apiBridgeClient from 'lib/api-bridge-client'

class App extends Component {

  constructor (props) {
    super(props)
    const {actions, state} = this.props

    this.socket = new Socket()
      .on('userListChange', this.handleUserListChange.bind(this))
  }

  handleUserListChange (data) {
    const {state, actions} = this.props

    // Store connected users in state.
    // Filter current user.
    if (state.user && state.user.remote) {
      actions.setDocumentPeers(data.body.users
        .filter(socketUser => socketUser.handle !== state.user.remote.handle))
    }
  }

  componentWillMount() {
    const {actions} = this.props

    apiBridgeClient.registerProgressCallback(actions.registerNetworkCall)
    ConnectionMonitor(2000).registerStatusChangeCallback(actions.setNetworkStatus)

    // Attempt to load user from session
    actions.loadUserFromSession()
  }

  componentDidMount() {
    const {actions} = this.props

    window.addEventListener('resize', debounce(() => {
      actions.setScreenWidth(window.innerWidth)
    }, 500))
  }

  componentDidUpdate(previousProps) {
    const {state, actions} = this.props
    const previousState = previousProps.state
    const room = previousState.router.room

    // State change: user has signed in. Load app config
    if (state.user.remote && state.app.status === Constants.STATUS_IDLE && !state.app.config) {
      actions.loadAppConfig()
    }

    // State change: app now has config
    if (!previousState.app.config && state.app.config) {
      actions.loadApis()
    }

    if (this.socket.getRoom() !== room) {
      this.socket.setRoom(room)
    }
    // TO-TO Handle leaving a room when the component changes
  }

  render() {
    const {history, state} = this.props

    if (state.api.status === Constants.STATUS_FAILED) {
      return (
        <ErrorView type={Constants.STATUS_FAILED} />
      )
    }

    return (
      <Router history={history}>
        <View
          authenticate
          component={HomeView}
          path="/"
        />

        <View
          component={PasswordResetView}
          path="/reset"
        />

        <View
          authenticate
          component={DocumentListView}
          path="/:group/:collection/document/edit/:documentId?/select/:referencedField?/:page?"
        />

        <View
          authenticate
          component={DocumentListView}
          path="/:collection/document/edit/:documentId?/select/:referencedField?/:page?"
        />

        <View
          authenticate
          component={DocumentEditView}
          path="/:group/:collection/document/edit/:documentId?/:section?"
        />

        <View
          authenticate
          component={DocumentEditView}
          path="/:collection/document/edit/:documentId?/:section?"
        />

        <View
          authenticate
          component={DocumentListView}
          path="/:group/:collection/document/new/:section?/:referencedField?/:page?"
        />

        <View
          authenticate
          component={DocumentListView}
          path="/:collection/document/new/:section?/:referencedField?/:page?"
        />

        <View
          authenticate
          component={DocumentCreateView}
          path="/:group/:collection/document/new/:section?"
        />

        <View
          authenticate
          component={DocumentCreateView}
          path="/:collection/document/new/:section?"
        />

        <View
          authenticate
          component={DocumentListView}
          path="/:group/:collection/documents/:page?"
        />

        <View
          authenticate
          component={DocumentListView}
          path="/:collection/documents/:page?"
        />

        <View
          authenticate
          component={ProfileEditView}
          path="/profile/:section?"
        />

        <View
          authenticate
          component={ProfileEditView}
          path="/profile/select/:referencedField?/:page?"
        />

        <View
          component={SignInView}
          path="/sign-in/:token?"
        />

        <View
          component={SignOutView}
          path="/sign-out"
        />

        <View
          authenticate
          component={ErrorView}
          default
          type={Constants.ERROR_ROUTE_NOT_FOUND}
        />
      </Router>
    )
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({
    ...apiActions,
    ...appActions,
    ...documentActions,
    ...userActions
  }, dispatch)
)(App)
