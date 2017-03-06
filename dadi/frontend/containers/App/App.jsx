import {h, Component} from 'preact'
import {Router, Layout, Route, route} from 'preact-router'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as userActions from 'actions/userActions'
import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'

import Header from 'components/Header/Header'
import Main from 'components/Main/Main'

import Api from 'views/Api/Api'
import Collection from 'views/Collection/Collection'
import DocumentEdit from 'views/DocumentEdit/DocumentEdit'
import DocumentList from 'views/DocumentList/DocumentList'
import Error from 'views/Error/Error'
import Home from 'views/Home/Home'
import MediaLibrary from 'views/MediaLibrary/MediaLibrary'
import PasswordReset from 'views/PasswordReset/PasswordReset'
import RoleEdit from 'views/RoleEdit/RoleEdit'
import RoleList from 'views/RoleList/RoleList'
import UserProfile from 'views/UserProfile/UserProfile'
import SignIn from 'views/SignIn/SignIn'
import SignOut from 'views/SignOut/SignOut'
import StyleGuide from 'views/StyleGuide/StyleGuide'

import {connectHelper, debounce, isEmpty, slugify} from 'lib/util'
import Socket from 'lib/socket'
import Session from 'lib/session'
import getAppConfig from 'lib/app-config'
import APIBridge from 'lib/api-bridge-client'

class App extends Component {
  componentWillMount() {
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
    const previousPath = previousState.routing.locationBeforeTransitions.pathname
    const path = state.routing.locationBeforeTransitions.pathname

    // State change: app config has been loaded
    if (!previousState.app.config && state.app.config) {
      this.initialiseSocket()
      this.getApiCollections()
    }

    // State change: user has signed in
    if (!previousState.user.user && state.user.user) {
      getAppConfig().then(config => {
        actions.setAppConfig(config)
      })
    }

    // State change: user has signed out
    if (previousState.user.user && !state.user.user) {
      route('/sign-in')
    }

    if (previousPath !== path && (this.socket && this.socket.getUser())) {
      this.socket.setRoom(path)
    }
  }

  render() {
    const {state, history} = this.props
    let routes
    if (state.app && state.app.config) {
      routes = this.groupRoutes()
    }

    // Semantically, it makes sense that <Main/> renders a HTML5 <main> element, which
    // should sit at the same level as <Header/>, which renders a HTML5 <header> element.
    // Not super excited that they have to be wrapped in a <div>, but this is something
    // we can revisit, potentially by replacing `preact-router` with `react-router`, which
    // supports view composition. For now, I think this is a decent compromise.
    //
    // -- eb, 01/02/2017
    return (
      <div>
        {state.user.user &&
          <Header
            compact={state.app.breakpoint === null}
            user={state.user.user}
            onSignOut={this.sessionEnd.bind(this)}
          />
        }

        {state.app && state.app.config && routes &&
          <Main>
            <Router history={history}>
              <Home path="/" authenticate />
              <PasswordReset path="/reset" authenticate/>
              <Api path="/apis/:api?" authenticate />
              <Collection path="/apis/:api/collections/:collection?" authenticate />
              {routes.map(path => (
                <DocumentList path={`/${path}/documents/:page?`} authenticate />
              ))}
              {routes.map(path => (
                <DocumentEdit path={`/${path}/document/:method/:document_id?`} authenticate />
              ))}
              {routes.map(path => (
                <MediaLibrary path={`/${path}/media/:document?`} authenticate/>
              ))}
              <UserProfile path="/profile" authenticate />
              <RoleList path="/roles" authenticate/>
              <RoleEdit path="/role/:method/:role?" authenticate />
              <SignIn path="/sign-in" />
              <SignOut path="/signout" />
              <StyleGuide path="/styleguide" />
              <Error type="404" default />
            </Router>
          </Main>
        }
      </div>
    )
  }

  groupRoutes() {
    const {state} = this.props
    const paths = []
    state.app.config.apis[0].menu.forEach(item => {
      if (typeof item === 'string') {
        paths.push(':collection')
      } else {
        item.collections.map(collection => {
          paths.push(`${slugify(item.title)}/:collection`)
        })
      }
    })
    return paths
  }

  getApiCollections() {
    const {state, actions} = this.props

    actions.setApiFetchStatus('isFetching')

    let bundler = APIBridge.Bundler()
    let apisToProcess = state.app.config.apis
    let processedApis = []

    apisToProcess.forEach((api, apiIndex) => {
      return APIBridge(api).getCollections().then(({collections}) => {
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

  sessionStart() {
    const {actions, state} = this.props

    new Session().getSession().then(user => {
      if (user) {
        actions.signIn(user)
      } else {
        // Trigger signout
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

  initialiseSocket() {
    const {actions, state} = this.props
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
