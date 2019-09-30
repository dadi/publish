import * as appActions from 'actions/appActions'
import * as userActions from 'actions/userActions'
import {
  Redirect,
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'
import {
  registerErrorCallback,
  registerProgressCallback
} from 'lib/api-bridge-client'
import AuthenticatedRoute from './AuthenticatedRoute'
import buildGroupedRoutes from './buildGroupedRoutes'
import {connectRedux} from 'lib/redux'
import {debounce} from 'lib/util'
import DocumentEditView from 'views/DocumentEditView/DocumentEditView'
import DocumentListView from 'views/DocumentListView/DocumentListView'
import ErrorView from 'views/ErrorView/ErrorView'
import HomeView from 'views/HomeView/HomeView'
import LoadingBar from 'containers/LoadingBar/LoadingBar'
import ProfileEditView from 'views/ProfileEditView/ProfileEditView'
import React from 'react'
import SignInView from 'views/SignInView/SignInView'

const baseRoutes = [
  {
    path: '/:collection/new/:section?',
    render: props => <DocumentEditView isNewDocument {...props} />
  },
  {
    path: '/:collection/:documentId/:section?',
    component: DocumentEditView
  },
  {
    path: '/:collection',
    component: DocumentListView
  }
]

function buildRoutes({menu, isMultiProperty}) {
  const routes = [...buildGroupedRoutes(menu, baseRoutes), ...baseRoutes]

  return isMultiProperty
    ? routes.map(route => ({
        ...route,
        path: '/:property' + route.path
      }))
    : routes
}

class App extends React.Component {
  constructor(props) {
    super(props)

    const {
      actions,
      api,
      user: {isSignedIn}
    } = props

    this.state = {
      routes: isSignedIn ? buildRoutes(api) : []
    }

    registerErrorCallback(actions.registerNetworkError)
    registerProgressCallback(actions.registerNetworkCall)
  }

  componentDidMount() {
    window.addEventListener(
      'resize',
      debounce(() => {
        this.props.actions.setScreenWidth(window.innerWidth)
      }, 200)
    )
    // Prevent accidental drops outside of asset drop handlers.
    document.addEventListener('dragover', e => e.preventDefault(), false)
    document.addEventListener('drop', e => e.preventDefault(), false)
  }

  componentDidUpdate(prevProps) {
    const {isSignedIn: wasSignedIn} = prevProps.user
    const {api, user} = this.props
    const {isSignedIn} = user

    if (!wasSignedIn && isSignedIn) {
      this.setState({routes: buildRoutes(api)})
      // Needed on mobile devices.
      window.scrollTo(0, 0)
    }

    if (isSignedIn && !this.sessionTimeout) {
      this.startSessionTimeout()
    }
  }

  startSessionTimeout() {
    const {actions, user} = this.props

    if (typeof user.accessTokenExpiry === 'number') {
      // We'll set a timer to sign the user out 5 seconds before their token expires.
      const timeout = user.accessTokenExpiry - Date.now() - 5000

      if (timeout < 0) return

      clearTimeout(this.sessionTimeout)
      this.sessionTimeout = setTimeout(() => {
        actions.signOut({
          sessionHasExpired: true
        })
      }, timeout)
    }
  }

  render() {
    return (
      <Router>
        <LoadingBar />

        <Switch>
          <AuthenticatedRoute path="/" exact component={HomeView} />
          <AuthenticatedRoute
            path="/sign-in/:token?"
            component={SignInView}
            isPublic
          />
          <Route
            path="/sign-out"
            render={() => {
              this.props.actions.signOut()

              return <Redirect to="/sign-in" />
            }}
          />
          <AuthenticatedRoute path="/profile" component={ProfileEditView} />
          <AuthenticatedRoute
            path="/media/:documentId/:section?"
            render={props => {
              props.route.params.collection = 'media'

              return <DocumentEditView exact {...props} />
            }}
          />
          <AuthenticatedRoute
            path="/media"
            render={props => {
              props.route.params.collection = 'media'

              return <DocumentListView exact {...props} />
            }}
          />
          {this.state.routes.map(route => (
            <AuthenticatedRoute key={route.path} exact {...route} />
          ))}
          <AuthenticatedRoute component={ErrorView} />
        </Switch>
      </Router>
    )
  }
}

const mapState = state => ({
  api: state.app.config.api,
  user: state.user
})

export default connectRedux(mapState, appActions, userActions)(App)
