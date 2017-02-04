import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { connect } from 'preact-redux'
import { bindActionCreators } from 'redux'
import { connectHelper } from '../../lib/util'

import * as userActions from '../../actions/userActions'

import Home from '../../views/Home/Home'
import Login from '../../views/Login/Login'
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
  }

  componentWillMount () {
    this.sessionStart()
  }

  componentDidUpdate () {
    const { state } = this.props
    if (!state.signedIn) {
      route('/login')
    }
  }

  render () {
    const { state, actions } = this.props

    return (
      <Router onChange={this.onRouteChange}>
        <Home path="/" />
        <Login path="/login" />
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
  state => state.user,
  dispatch => bindActionCreators(userActions, dispatch)
)(App)
