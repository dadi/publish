import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
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
import buildGroupedRoutes from './buildGroupedRoutes'
import {connectRedux} from 'lib/redux'
import {debounce} from 'lib/util'
import DocumentEditView from 'views/DocumentEditView/DocumentEditView'
import DocumentListView from 'views/DocumentListView/DocumentListView'
import ErrorView from 'views/ErrorView/ErrorView'
import HomeView from 'views/HomeView/HomeView'
import LoadingBar from 'containers/LoadingBar/LoadingBar'
import NotificationCentre from 'containers/NotificationCentre/NotificationCentre'
import ProfileEditView from 'views/ProfileEditView/ProfileEditView'
import React from 'react'
import SignInView from 'views/SignInView/SignInView'
import WrappedRoute from './WrappedRoute'

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

class App extends React.Component {
  constructor(props) {
    super(props)

    const {
      actions,
      api: {menu, properties}
    } = props

    this.routes = [...buildGroupedRoutes(menu, baseRoutes), ...baseRoutes]

    if (properties && properties.length) {
      this.routes = this.routes.map(route => ({
        ...route,
        path: '/:property' + route.path
      }))
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
    document.addEventListener('dragstart', e => e.preventDefault(), false)
    document.addEventListener('dragend', e => e.preventDefault(), false)
    document.addEventListener('dragover', e => e.preventDefault(), false)
    document.addEventListener('dragenter', e => e.preventDefault(), false)
    document.addEventListener('dragleave', e => e.preventDefault(), false)
    document.addEventListener('drop', e => e.preventDefault(), false)
  }

  componentDidUpdate(prevProps) {
    const {isSignedIn} = this.props
    const {isSignedIn: wasSignedIn} = prevProps

    if (!wasSignedIn && isSignedIn) {
      // Needed on mobile devices.
      window.scrollTo(0, 0)
    }
  }

  render() {
    return (
      <Router>
        <LoadingBar />
        <NotificationCentre />
        <Switch>
          <WrappedRoute path="/" exact component={HomeView} />
          <WrappedRoute
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
          <WrappedRoute path="/profile/:section?" component={ProfileEditView} />
          {this.routes.map(route => (
            <WrappedRoute key={route.path} exact {...route} />
          ))}
          <WrappedRoute component={ErrorView} />
        </Switch>
      </Router>
    )
  }
}

const mapState = state => ({
  api: state.app.config.api,
  isSignedIn: state.user.isSignedIn
})

export default connectRedux(
  mapState,
  apiActions,
  appActions,
  documentActions,
  userActions
)(App)
