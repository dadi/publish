import {Component, h} from 'preact'
import {Router, route} from 'preact-router'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

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
import PasswordReset from 'views/PasswordReset/PasswordReset'
import SignInView from 'views/SignInView/SignInView'
import SignOutView from 'views/SignOutView/SignOutView'
import ProfileEditView from 'views/ProfileEditView/ProfileEditView'

import {connectHelper, debounce, isEmpty, slugify, throttle} from 'lib/util'
import Socket from 'lib/socket'
import ConnectionMonitor from 'lib/status'
import Session from 'lib/session'
import {getAppConfig, getCurrentApi} from 'lib/app-config'
import APIBridge from 'lib/api-bridge-client'

class App extends Component {
  componentWillMount() {
    const {actions} = this.props

    APIBridge.registerProgressCallback(actions.registerNetworkCall)
    ConnectionMonitor(2000).registerStatusChangeCallback(actions.setNetworkStatus)

    this.sessionStart()
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
    const previousPath = previousState.router.locationBeforeTransitions.pathname
    const path = state.router.locationBeforeTransitions.pathname

    // State change: user has signed in
    if (!previousState.user.local && state.user.local) {
      const {actions} = this.props

      getAppConfig().then(config => {
        actions.setAppConfig(config)

        // Start socket logic
        this.initialiseSocket(config)

        // Load api collections
        this.getApiCollections(config)
      })
    }

    // State change: user has signed out
    if (previousState.user.local && !state.user.local) {
      route('/sign-in')
    }
    if (this.socket && this.socket.getUser() && (this.socket.getRoom() !== path)) {
      this.socket.setRoom(path)
    }
  }

  render() {
    const {history, state} = this.props
    const hasRoutes = state.app && state.app.config ? this.hasRoutes() : null

    return (
      <Router history={history}>
        <HomeView path="/" authenticate />
        <PasswordReset path="/reset" authenticate/>
        {hasRoutes && (<DocumentEditView path="/:group/:collection/document/edit/:documentId?/:section?/:field?" authenticate />)}
        <DocumentEditView path="/:collection/document/edit/:documentId?/:section?/:field?" authenticate />
        {hasRoutes && (<DocumentCreateView path="/:group/:collection/document/new/:section?" authenticate />)}
        <DocumentCreateView path="/:collection/document/new/:section?" authenticate />
        <DocumentListView path="/:collection/documents/:page?" authenticate />
        {hasRoutes && (<DocumentListView path="/:group/:collection/documents/:page?" authenticate />)}
        <ProfileEditView path="/profile/:section?" authenticate />
        <SignInView path="/sign-in" />
        <SignOutView path="/sign-out" />
        <ErrorView type="404" default />
      </Router>
    )
  }

  hasRoutes() {
    const {state} = this.props
    const foundMenus = state.app.config.apis.some(api => {
      return typeof api.menu !== 'undefined'
    })

    return foundMenus
  }

  initialiseSocket(config) {
    const {actions, state} = this.props
    const pathname = state.router.locationBeforeTransitions.pathname
    const user = state.user.local
    const session = new Session()

    this.socket = new Socket(config.server.port)
      .on('userListChange', data => {
        // Store connected users in state.
        // Filter current user
        actions.setDocumentPeers(data.body.users
          .filter(socketUser => socketUser.handle !== user.handle))
      })
      .setUser(user)
      .setRoom(pathname)
  }

  getApiCollections(config) {
    const {actions, state} = this.props

    actions.setApiStatus(Constants.STATUS_LOADING)

    let apisToProcess = config.apis
    let processedApis = []

    apisToProcess.forEach((api, apiIndex) => {
      let bundler = APIBridge.Bundler()

      return APIBridge(api).getCollections().then(({collections}) => {
        collections.forEach(collection => {
          const query = APIBridge(api, true).in(collection.slug).getConfig()

          // Add query to bundler
          bundler.add(query)
        })

        // Run all queries in bundler
        bundler.run().then(collectionConfigs => {
          const mergedCollections = collectionConfigs.map((config, index) => {
            return Object.assign({}, config, collections[index])
          }).filter(collection => {
            return !(collection.settings.publish && collection.settings.publish.hidden)
          })

          const apiWithCollections = Object.assign({}, api, {
            collections: mergedCollections,
            hasCollections: true
          })

          actions.setApi(apiWithCollections)
        })
      })
    })
  }

  sessionStart() {
    const {actions, state} = this.props

    new Session().getSession().then(user => {
      if (user && !user.err) {
        actions.setRemoteUser(user)
      } else {
        actions.signOut()
        route('/sign-in')
      }
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...userActions, ...apiActions, ...appActions, ...documentActions}, dispatch)
)(App)
