import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import * as _ from 'underscore'

import { connectHelper } from '../../lib/util'
import * as userActions from '../../actions/userActions'
import * as apiActions from '../../actions/apiActions'

import Home from '../../views/Home/Home'
import SignIn from '../../views/SignIn/SignIn'
import Api from '../../views/Api/Api'
import Collection from '../../views/Collection/Collection'
import DocumentList from '../../views/DocumentList/DocumentList'
import DocumentEdit from '../../views/DocumentEdit/DocumentEdit'
import UserList from '../../views/UserList/UserList'
import UserEdit from '../../views/UserEdit/UserEdit'
import RoleList from '../../views/RoleList/RoleList'
import RoleEdit from '../../views/RoleEdit/RoleEdit'
import StyleGuide from '../../views/StyleGuide/StyleGuide'
import Error from '../../views/Error/Error'

/**
 * Lib
 */
import Socket from '../../lib/socket'
import Session from '../../lib/session'
import APIBridge from '../../lib/api-bridge-client'


// Setup
let currentUrl = '/'
let socket = new Socket()
let session = new Session()

socket.on( 'message', msg => {
  console.log("message", msg)
})

socket.on('userDidEnter', data => {
  console.log("New User", data)
})

socket.setUser({
  user: {
    name: `Publish User`
  }
})

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

  componentDidUpdate () {
    const { state } = this.props
    if (!state.user.signedIn && config['server.authenticate']) {
      route('/signin')
    }
  }

  componentDidMount() {
    const { state } = this.props
    if (state.user.signedIn || !config['server.authenticate']) {
      this.getApiCollections()
    }
  }

  render () {
    const { state, actions } = this.props

    return (
      <Router onChange={this.onRouteChange}>
        <Home path="/" />
        <SignIn path="/signin" />
        <Api path="/apis/:api?" authenticate />
        <Collection path="/apis/:api/collections/:collection?" authenticate />
        <DocumentList path="/apis/:api/collections/:collection/documents" authenticate />
        <DocumentEdit path="/apis/:api/collections/:collection/document/:method/:document?" authenticate />
        <UserList path="/users" authenticate/>
        <UserEdit path="/user/:method/:user?" authenticate />
        <RoleList path="/roles" authenticate/>
        <RoleEdit path="/role/:method/:role?" authenticate />
        <StyleGuide path="/styleguide" />
        <Error type="404" default />
      </Router>
    )
  }

  onRouteChange (e) {
    const { actions, state } = this.props
    currentUrl = e.url
    socket.setRoom(currentUrl)
  }

  getApiCollections () {
    const { state, actions } = this.props

    let queue = _.chain(state.api.apis)
    .filter(api => {
      return !api.hasCollections
    })
    .map((api, key) => {
      return APIBridge(api)
      .getCollections()
      .then(collections => {
        return this.getCollectionSchemas({api, ...JSON.parse(collections)}).then(collections => {
          return _.extend(state.api.apis[key], {collections, hasCollections: true})
        })
      }).catch((err) => {
        // TODO: Graceful deal with failure
      })
    }).value()

    return Promise.all(queue).then(() => {
      actions.setApiList(state.api.apis)
    })
  }

  getCollectionSchemas ({api, collections}) {
    let queue = _.map(collections, collection => {
      return APIBridge(api)
      .in(collection.slug)
      .getConfig()
      .then(config => {
        collection = _.extend(collection, JSON.parse(config))
      }).catch(err => {
        // TODO: Graceful deal with failure
      })
    })
    return Promise.all(queue).then(resp => {
      return collections
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
      }
    })
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators(_.assign(userActions, apiActions), dispatch)
)(App)
