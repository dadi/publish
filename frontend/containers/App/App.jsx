import {Component, h} from 'preact'
import {Router, route} from '@dadi/preact-router'
import {bindActionCreators} from 'redux'
import Socket from 'lib/socket'

import * as userActions from 'actions/userActions'
import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as routerActions from 'actions/routerActions'
import * as Constants from 'lib/constants'

import DocumentCreateView from 'views/DocumentCreateView/DocumentCreateView'
import DocumentEditView from 'views/DocumentEditView/DocumentEditView'
import DocumentListView from 'views/DocumentListView/DocumentListView'
import ErrorView from 'views/ErrorView/ErrorView'
import HomeView from 'views/HomeView/HomeView'
import MediaListView from 'views/MediaListView/MediaListView'
import PasswordResetView from 'views/PasswordResetView/PasswordResetView'
import SignInView from 'views/SignInView/SignInView'
import SignOutView from 'views/SignOutView/SignOutView'
import ProfileEditView from 'views/ProfileEditView/ProfileEditView'

import {connectHelper, debounce} from 'lib/util'
import {urlHelper} from 'lib/util/url-helper'
import Analytics from 'lib/analytics'
import ConnectionMonitor from 'lib/status'
import apiBridgeClient from 'lib/api-bridge-client'

class App extends Component {

  componentWillMount() {
    const {actions, state} = this.props

    apiBridgeClient.registerProgressCallback(actions.registerNetworkCall)

    // We only load the APIs at this point if the user is already signed in
    // (existing session). Otherwise, it will be loaded upon successful login.
    if (state.user.accessToken) {
      actions.loadApis()
    }
  }

  componentDidMount() {
    const {actions, state} = this.props
    const conf = state.app.config

    // this.socket = new Socket(
    //   conf.publicUrl.port || conf.server.port
    // ).on('userListChange', this.handleUserListChange.bind(this))

    window.addEventListener('resize', debounce(() => {
      actions.setScreenWidth(window.innerWidth)
    }, 500))
    document.addEventListener('dragstart', this.handleDragDropEvents, false)
    document.addEventListener('dragend', this.handleDragDropEvents, false)
    document.addEventListener('dragover', this.handleDragDropEvents, false)
    document.addEventListener('dragenter', this.handleDragDropEvents, false)
    document.addEventListener('dragleave', this.handleDragDropEvents, false)
    document.addEventListener('drop', this.handleDragDropEvents, false)
  }

  componentDidUpdate(previousProps) {
    const {actions, state} = this.props
    const previousState = previousProps.state
    const room = previousState.router.room
    const conf = state.app.config
    const prevConf = previousState.app.config

    if (
      (!prevConf && conf) &&
      conf.server.healthcheck.enabled
    ) {
      this.monitor = new ConnectionMonitor()
        .watch(conf.server.healthcheck.frequency)
        .registerStatusChangeCallback(actions.setNetworkStatus)

      if (conf.ga.enabled) {
        this.analytics = new Analytics()
          .register(conf.ga.trackingId)
          .pageview(state.router.locationBeforeTransitions.pathname)
      }
    }

    // State change: user has signed in.
    if (!previousState.user.accessToken && state.user.accessToken) {
      actions.loadApis()

      let redirectUri = state.router.search.redirect
        ? decodeURIComponent(state.router.search.redirect)
        : '/'

      return route(redirectUri)
    }

    // State change: token is invalid.
    if (previousState.user.accessToken && !state.user.accessToken) {
      return route('/sign-in')
    }

    if (this.socket && this.socket.getRoom() !== room) {
      this.socket.setRoom(room)
    }

    if (
      this.socket &&
      previousState.user.remote && !previousState.user.remote.error &&
      previousState.user.remote !== this.socket.getUser()
    ) {
      this.socket.setUser(previousState.user.remote)
    }
  }

  render() {
    const {history, state} = this.props

    if (state.api.error) {
      return (
        <ErrorView type={Constants.API_CONNECTION_ERROR} data={state.api.error} />
      )
    }

    let createPaths = (state.api.paths && state.api.paths.create) || []
    let editPaths = (state.api.paths && state.api.paths.edit) || []
    let listPaths = (state.api.paths && state.api.paths.list) || []

    return (
      <Router
        history={history}
        onChange={this.handleRouteChange.bind(this)}
      >
        <HomeView
          authenticate
          path="/"
        />

        <PasswordResetView
          path="/reset"
        />

        <ProfileEditView
          authenticate
          path="/profile/:section?"
        />

        <ProfileEditView
          authenticate
          path="/profile/select/:referencedField?/:page?[^\d+$]"
        />

        <SignInView
          path="/sign-in/:token?"
        />

        <SignOutView
          path="/sign-out"
        />

        {createPaths.map(path => (
          <DocumentCreateView
            authenticate
            path={path}
          />
        ))}

        {editPaths.map(path => (
          <DocumentEditView
            authenticate
            path={path}
          />
        ))}

        {listPaths.map(path => (
          <DocumentListView
            authenticate
            path={path}
          />
        ))}

        <MediaListView
          authenticate
          path="/media/:bucketName?"
        />

        <ErrorView
          authenticate
          default
          type={Constants.ERROR_ROUTE_NOT_FOUND}
        />
      </Router>
    )
  }

  /**
   * Handle Drag Drop Events 
   * Block and drag and drop actions to handle accidental
   * drop outside of FileUpload and other asset drop handlers.
   * @param  {Event} event Event listener object.
   */
  handleDragDropEvents(event) {
    event.preventDefault()
  }

  handleRouteChange(event) {
    const {actions, state} = this.props
    const currentRouteAttributes =
      (event.current && event.current.attributes) || {}
    const currentRouteIsAuthenticated = Boolean(
      currentRouteAttributes.authenticate
    )

    let search = urlHelper().paramsToObject(window.location.search)
    let parameters = currentRouteAttributes.matches

    // Remove `search` parameters from `parameters`
    Object.keys(search || {}).forEach(key => {
      delete parameters[key]
    })

    // This is a special case where the document create route
    // wrongly matches the pattern specified by the document
    // list view (e.g. /articles/new matches /:group/:collection).
    // When this happens, we correct the parameters before
    // sending the parameters to the action.
    if (parameters.collection === 'new') {
      parameters.collection = parameters.group
      parameters.group = undefined
    }

    actions.setRouteParameters(parameters)

    if (this.analytics && this.analytics.isActive()) {
      this.analytics.pageview(event.url)
    }

    // We redirect the user to the sign-in route if they are trying
    // to access a protected route without an access token OR they
    // have just signed out.
    if (
      (currentRouteIsAuthenticated && !state.user.accessToken) ||
      event.url === '/sign-out'
    ) {
      let redirectParam = event.url === '/'
        ? ''
        : `?redirect=${encodeURIComponent(event.url)}`

      return route(`/sign-in${redirectParam}`)
    }
  }

  handleUserListChange(data) {
    const {state, actions} = this.props

    // Store connected users in state.
    // Filter current user.
    if (state.user && state.user.remote) {
      actions.setDocumentPeers(data.body.users
        .filter(socketUser => socketUser.handle !== state.user.remote.handle))
    }
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({
    ...apiActions,
    ...appActions,
    ...documentActions,
    ...routerActions,
    ...userActions
  }, dispatch)
)(App)
