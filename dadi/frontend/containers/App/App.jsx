import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'

import * as userActions from 'actions/userActions'
import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'

import Main from 'components/Main/Main'

import Api from 'views/Api/Api'
import Collection from 'views/Collection/Collection'
import DocumentEdit from 'views/DocumentEdit/DocumentEdit'
import DocumentList from 'views/DocumentList/DocumentList'
import Error from 'views/Error/Error'
import Home from 'views/Home/Home'
import MediaLibrary from 'views/MediaLibrary/MediaLibrary'
import Nav from 'components/Nav/Nav'
import PasswordReset from 'views/PasswordReset/PasswordReset'
import RoleEdit from 'views/RoleEdit/RoleEdit'
import RoleList from 'views/RoleList/RoleList'
import UserProfile from 'views/UserProfile/UserProfile'
import SignIn from 'views/SignIn/SignIn'
import StyleGuide from 'views/StyleGuide/StyleGuide'

import { connectHelper } from 'lib/util'
import Socket from 'lib/socket'
import Session from 'lib/session'
import getAppConfig from 'lib/app-config'
import APIBridge from 'lib/api-bridge-client'

class App extends Component {

  constructor(props) {
    super(props)
  }

  componentWillMount () {
    this.sessionStart()
  }

  componentDidUpdate(previousProps) {
    const { state, actions } = this.props
    const previousState = previousProps.state
    const previousPath = previousState.routing.locationBeforeTransitions.pathname
    const path = state.routing.locationBeforeTransitions.pathname

    // State change: app config has been loaded
    if (!previousState.app.config && state.app.config) {
      this.initialiseSocket()
      this.getApiCollections()
    }

    // State change: user is now signed in
    if (!previousState.user.signedIn && state.user.signedIn) {
      getAppConfig().then(config => {
        actions.setAppConfig(config)
      })
    }

    if (previousPath !== path && (this.socket && this.socket.getUser())) {
      this.socket.setRoom(path)
    }
  }

  render () {
    const { state, history } = this.props

    return (
      <Main>
        <Nav apis={ state.api.apis } />
        
        <Router history={history}>
          <Home path="/" authenticate />
          <PasswordReset path="/reset" authenticate/>
          <Api path="/apis/:api?" authenticate />
          <Collection path="/apis/:api/collections/:collection?" authenticate />
          <DocumentList path="/:collection/documents/:page?" authenticate />
          <DocumentEdit path="/:collection/document/:method/:document_id?" authenticate />
          <MediaLibrary path="/:collection/media/:document?" authenticate/>
          <UserProfile path="/profile" authenticate />
          <RoleList path="/roles" authenticate/>
          <RoleEdit path="/role/:method/:role?" authenticate />
          <SignIn path="/signin" />
          <StyleGuide path="/styleguide" />
          <Error type="404" default />
        </Router>
      </Main>
    )
  }

  getApiCollections () {
    const { state, actions } = this.props

    actions.setApiFetchStatus('isFetching')

    let bundler = APIBridge.Bundler()
    let apisToProcess = state.app.config.apis
    let processedApis = []

    apisToProcess.forEach((api, apiIndex) => {
      return APIBridge(api).getCollections().then(({ collections }) => {
        collections.forEach(collection => {
          let query = APIBridge(api, true).in(collection.slug).getConfig()

          // Add query to bundler
          bundler.add(query)
        })

        // Run all queries in bundler
        bundler.run().then(collectionConfigs => {
          let mergedCollections = collectionConfigs.map((config, index) => {
            return Object.assign({}, config, collections[index])
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

  sessionStart () {
    const { actions, state } = this.props

    new Session().getSession().then((session) => {
      if (session.signedIn) {
        actions.signIn(session.username, session.signedIn)
      } else {
        // Trigger signout
        actions.signOut()
        route('/signin')
      }
    })
  }

  initialiseSocket() {
    const { actions, state } = this.props
    const pathname = state.routing.locationBeforeTransitions.pathname

    let session = new Session()

    let socket = new Socket(state.app.config.server.port)
      .on('userListChange', data => {
        // Table of connected users
        // console.table(data.body.users)
      })
      .setUser(Object.assign({}, state.user, {
        vendor: navigator.vendor,
        identifier: `${state.user.username}_${navigator.vendor}`
      })).setRoom(pathname)

    // Save reference to `socket` as a private variable
    this.socket = socket
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...userActions, ...apiActions, ...appActions}, dispatch)
)(App)
