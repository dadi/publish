import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'

import { connectHelper } from '../../lib/util'
import * as userActions from '../../actions/userActions'
import * as apiActions from '../../actions/apiActions'

import Api from '../../views/Api/Api'
import Collection from '../../views/Collection/Collection'
import DocumentEdit from '../../views/DocumentEdit/DocumentEdit'
import DocumentList from '../../views/DocumentList/DocumentList'
import Error from '../../views/Error/Error'
import Home from '../../views/Home/Home'
import MediaLibrary from '../../views/MediaLibrary/MediaLibrary'
import PasswordReset from '../../views/PasswordReset/PasswordReset'
import RoleEdit from '../../views/RoleEdit/RoleEdit'
import RoleList from '../../views/RoleList/RoleList'
import UserProfile from '../../views/UserProfile/UserProfile'
import SignIn from '../../views/SignIn/SignIn'
import StyleGuide from '../../views/StyleGuide/StyleGuide'

/*
 * Libs
 */
import Socket from '../../lib/socket'
import Session from '../../lib/session'
import APIBridge from '../../lib/api-bridge-client'

/*
* Setup
 */
let currentUrl = '/'
let socket = new Socket()
let session = new Session()

socket.on( 'message', msg => {
  console.log("message", msg)
})

socket.on('userDidEnter', data => {
  console.log("New User", data)
})

socket.on('userDidLeave', data => {
  console.log("Users", data)
})

// socket.setUser({
//   user: {
//     name: `Publish User`
//   }
// })

class App extends Component {

  constructor(props) {
    super(props)

    // Bind class methods
    this.onRouteChange = this.onRouteChange.bind(this)
    this.getApiCollections = this.getApiCollections.bind(this)
  }

  componentWillMount () {
    this.sessionStart()
  }

  componentDidUpdate() {
    const { state, actions } = this.props
    if (state.user.signedIn || !config.server.authenticate) {
      if (!socket.getUser()) {
        socket.setUser({user: {username: state.user.username}}).setRoom(currentUrl)
      }
      if (state.api.status === 'canFetch') {
        this.getApiCollections()
      }
    }
  }

  render () {
    const { state, actions } = this.props

    return (
      <Router onChange={this.onRouteChange}>
        <Home path="/" authenticate />
        <PasswordReset path="/reset" authenticate/>
        <Api path="/apis/:api?" authenticate />
        <Collection path="/apis/:api/collections/:collection?" authenticate />
        <DocumentList path="/:collection/documents/:page?" authenticate />
        <DocumentEdit path="/:collection/document/:method/:document?" authenticate />
        <MediaLibrary path="/:collection/media/:document?" authenticate/>
        <UserProfile path="/profile" authenticate />
        <RoleList path="/roles" authenticate/>
        <RoleEdit path="/role/:method/:role?" authenticate />
        <SignIn path="/signin" />
        <StyleGuide path="/styleguide" />
        <Error type="404" default />
      </Router>
    )
  }

  onRouteChange (e) {
    const { actions, state } = this.props
    currentUrl = e.url
    if (socket.getUser()) {
      socket.setRoom(currentUrl)
    }
  }

  getApiCollections () {
    const { state, actions } = this.props
    actions.setApiFetchStatus('isFetching')

    let bundler = APIBridge.Bundler()
    let processedApis = []

    state.api.apis.filter(api => !api.hasCollections).forEach((api, apiIndex) => {
      return APIBridge(api).getCollections().then(({ collections }) => {
        collections.forEach(collection => {
          let query = APIBridge(api, true).in(collection.slug)
                                          .getConfig()

          // Add query to bundler
          bundler.add(query)
        })

        // Run all queries in bundler
        bundler.run().then(collectionConfigs => {
          let mergedCollections = collectionConfigs.map((config, index) => {
            return Object.assign({}, config, collections[index])
          })

          const apiWithCollections = Object.assign({}, api, {collections: mergedCollections, hasCollections: true})

          processedApis.push(apiWithCollections)

          // Have all APIs been processed?
          if (processedApis.length === state.api.apis.length) {
            actions.setApiList(processedApis)
            actions.setApiFetchStatus('fetchComplete')
          }
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
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators({...userActions, ...apiActions}, dispatch)
)(App)
