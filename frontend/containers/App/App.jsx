import {Component, h} from 'preact'
import {Router, route} from 'preact-router'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './App.css'

import * as userActions from 'actions/userActions'
import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'

import Header from 'components/Header/Header'
import LoadingBar from 'components/LoadingBar/LoadingBar'
import Main from 'components/Main/Main'

import DocumentCreateView from 'views/DocumentCreateView/DocumentCreateView'
import DocumentEditView from 'views/DocumentEditView/DocumentEditView'
import DocumentListView from 'views/DocumentListView/DocumentListView'
import Error from 'views/Error/Error'
import Home from 'views/Home/Home'
import MediaLibrary from 'views/MediaLibrary/MediaLibrary'
import PasswordReset from 'views/PasswordReset/PasswordReset'
import SignIn from 'views/SignIn/SignIn'
import SignOut from 'views/SignOut/SignOut'
import ProfileEditView from 'views/ProfileEditView/ProfileEditView'

import {connectHelper, debounce, isEmpty, slugify} from 'lib/util'
import Socket from 'lib/socket'
import {isOnline, isServerOnline} from 'lib/status'
import Session from 'lib/session'
import {getAppConfig, getCurrentApi} from 'lib/app-config'
import APIBridge from 'lib/api-bridge-client'

class App extends Component {
  componentWillMount() {
    const {actions} = this.props

    APIBridge.registerProgressCallback(actions.registerNetworkCall)

    // setInterval(() => {
    //   console.log('isOnline', isOnline())
    //   isServerOnline().then(resp => console.log('isServerOnline', resp))
    // }, 1000)
    
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

    if (previousPath !== path && (this.socket && this.socket.getUser())) {
      this.socket.setRoom(path)
    }
  }

  render() {
    const {history, state} = this.props
    const hasRoutes = state.app && state.app.config ? this.hasRoutes() : null
    const isFetchingData = state.app.status === Constants.STATUS_LOADING

    // Semantically, it makes sense that <Main/> renders a HTML5 <main> element, which
    // should sit at the same level as <Header/>, which renders a HTML5 <header> element.
    // Not super excited that they have to be wrapped in a <div>, but this is something
    // we can revisit, potentially by replacing `preact-router` with `react-router`, which
    // supports view composition. For now, I think this is a decent compromise.
    //
    // -- eb, 01/02/2017

    return (
      <div class={styles.container}>
        <LoadingBar loading={isFetchingData} />

        {state.user.local &&
          <Header
            compact={state.app.breakpoint === null}
            user={state.user.local}
            onSignOut={this.sessionEnd.bind(this)}
          />
        }

        <Main>
          <Router history={history}>
            <Home path="/" authenticate />
            <PasswordReset path="/reset" authenticate/>
            {hasRoutes && (<DocumentEditView path="/:group/:collection/document/edit/:documentId?/:section?" authenticate />)}
            <DocumentEditView path="/:collection/document/edit/:documentId?/:section?" authenticate />
            {hasRoutes && (<DocumentCreateView path="/:group/:collection/document/new/:section?" authenticate />)}
            <DocumentCreateView path="/:collection/document/new/:section?" authenticate />
            <DocumentListView path="/:collection/documents/:page?" authenticate />
            {hasRoutes && (<DocumentListView path="/:group/:collection/documents/:page?" authenticate />)}
            <MediaLibrary path="/:collection/media/:document?" authenticate/>
            {hasRoutes && (<MediaLibrary path="/:group/:collection/media/:document?" authenticate/>)}
            <ProfileEditView path="/profile/:section?" authenticate />
            <SignIn path="/sign-in" />
            <SignOut path="/sign-out" />
            <Error type="404" default />
          </Router>
        </Main>
      </div>
    )
  }

  hasRoutes() {
    const {state} = this.props
    const foundMenus = state.app.config.apis.some(api => {
      return typeof api.menu !== 'undefined'
    })

    return state
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

  sessionEnd() {
    const {actions, state} = this.props
    const session = new Session()

    session.getSession().then(user => {
      if (user) {
        session.destroy().then(success => {
          // (!) TO DO: Handle failure of session destroy
          if (success) {
            actions.signOut()
            route('/sign-in')
          }
        })
      }
    })
  }

  initialiseSocket(config) {
    const {actions, state} = this.props
    const pathname = state.router.locationBeforeTransitions.pathname

    const session = new Session()
    const socket = new Socket(config.server.port)
      .on('userListChange', data => {
        // Table of connected users
        // console.table(data.body.users)
      })
      .setUser(Object.assign({}, state.user, {
        vendor: navigator.vendor,
        identifier: `${state.user.localname}_${navigator.vendor}`
      })).setRoom(pathname)

    // Save reference to `socket` as a private variable
    this.socket = socket
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...userActions, ...apiActions, ...appActions}, dispatch)
)(App)
