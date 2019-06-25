import * as apiActions from 'actions/apiActions'
import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'
import * as userActions from 'actions/userActions'
import React from 'react'
import {debounce} from 'lib/util'
import {decodeSearch, encodeSearch} from 'lib/util/url'
import {connectRedux} from 'lib/redux'
import {
  BrowserRouter as Router,
  Redirect,
  Route as RawRoute,
  Switch
} from 'react-router-dom'
import {
  registerErrorCallback,
  registerProgressCallback
} from 'lib/api-bridge-client'
import DocumentEditView from 'views/DocumentEditView/DocumentEditView'
import DocumentListView from 'views/DocumentListView/DocumentListView'
import ErrorView from 'views/ErrorView/ErrorView'
import HomeView from 'views/HomeView/HomeView'
import LoadingBar from 'containers/LoadingBar/LoadingBar'
import NotificationCentre from 'containers/NotificationCentre/NotificationCentre'
import ReferenceSelectView from 'views/ReferenceSelectView/ReferenceSelectView'
import SignInView from 'views/SignInView/SignInView'
import ProfileEditView from 'views/ProfileEditView/ProfileEditView'

const REGEX_NUMBER = '([0-9]+)'
const REGEX_DOCUMENT_ID =
  '([a-f0-9]{24}|[a-f0-9]{32}|[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'
const REGEX_SLUG = '([a-z-]+)'

class Route extends React.Component {
  buildBaseUrl({
    collection = this.props.route.params.collection,
    createNew,
    documentId = this.props.route.params.documentId,
    group = this.props.route.params.group,
    page,
    referenceFieldSelect = this.props.route.params.referenceField,
    search = decodeSearch(window.location.search),
    section = this.props.route.params.section
  } = {}) {
    let urlNodes = [group, collection]

    if (createNew) {
      urlNodes.push('new')
    } else {
      urlNodes.push(documentId)
    }

    if (referenceFieldSelect) {
      urlNodes = urlNodes.concat(['select', referenceFieldSelect])
    } else if (documentId || createNew) {
      urlNodes.push(section)
    }

    if (page) {
      urlNodes.push(page)
    }

    const url = urlNodes.filter(Boolean).join('/') + encodeSearch(search)

    return `/${url}`
  }

  componentWillReceiveProps(newProps) {
    const {isSignedIn, location} = this.props

    if (!isSignedIn && newProps.isSignedIn) {
      const {redirect} = decodeSearch(location.search)

      this.redirectUrl = redirect ? decodeURIComponent(redirect) : '/'
    } else {
      this.redirectUrl = undefined
    }
  }

  render() {
    if (this.redirectUrl) {
      return <Redirect to={this.redirectUrl} />
    }

    const {
      isSignedIn,
      component: Component,
      config,
      mustBeSignedIn,
      render,
      ...routeProps
    } = this.props

    return (
      <RawRoute
        {...routeProps}
        render={props => {
          if (mustBeSignedIn && !isSignedIn) {
            const redirectPath = routeProps.location.pathname
            const redirectParam = ['/', '/sign-out'].includes(redirectPath)
              ? ''
              : `?redirect=${encodeURIComponent(redirectPath)}`

            return <Redirect to={`/sign-in${redirectParam}`} />
          }

          if (typeof render === 'function') {
            return render(props)
          }

          const route = {
            params: routeProps.computedMatch.params,
            path: routeProps.location.pathname,
            search: decodeSearch(routeProps.location.search),
            searchString: routeProps.location.search
          }

          return (
            <>
              <NotificationCentre route={route} />

              <Component
                {...props}
                onBuildBaseUrl={this.buildBaseUrl}
                route={route}
              />
            </>
          )
        }}
      />
    )
  }
}

class App extends React.Component {
  componentWillMount() {
    const {actions} = this.props

    registerErrorCallback(actions.registerNetworkError)
    registerProgressCallback(actions.registerNetworkCall)
  }

  componentDidMount() {
    const {actions} = this.props

    window.addEventListener(
      'resize',
      debounce(() => {
        actions.setScreenWidth(window.innerWidth)
      }, 500)
    )
    document.addEventListener('dragstart', this.handleDragDropEvents, false)
    document.addEventListener('dragend', this.handleDragDropEvents, false)
    document.addEventListener('dragover', this.handleDragDropEvents, false)
    document.addEventListener('dragenter', this.handleDragDropEvents, false)
    document.addEventListener('dragleave', this.handleDragDropEvents, false)
    document.addEventListener('drop', this.handleDragDropEvents, false)
  }

  componentDidUpdate(previousProps) {
    const {state} = this.props
    const previousState = previousProps.state

    // State change: user has signed in.
    if (!previousState.user.isSignedIn && state.user.isSignedIn) {
      // Scrolling to top (needed on mobile devices).
      window.scrollTo(0, 0)

      // Initialise session timer.
      this.initialiseSessionTimers()
    }
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

  initialiseSessionTimers() {
    const {actions, state} = this.props
    const {user} = state

    if (typeof user.accessTokenExpiry === 'number') {
      // We'll set a timer to sign the user out 5 seconds before their token expires.
      const timeout = user.accessTokenExpiry - Date.now() - 5000

      if (timeout < 0) return

      clearTimeout(this.sessionTimer)

      this.sessionTimer = setTimeout(() => {
        actions.signOut({
          sessionHasExpired: true
        })
      }, timeout)
    }
  }

  render() {
    const {actions, state} = this.props

    if (state.api.error) {
      return (
        <Router>
          <ErrorView
            data={state.api.error}
            type={Constants.API_CONNECTION_ERROR}
          />
        </Router>
      )
    }

    const {isSignedIn} = state.user

    if (isSignedIn && !this.sessionTimer) {
      this.initialiseSessionTimers()
    }

    return (
      <Router>
        <LoadingBar />

        <Switch>
          <Route
            isSignedIn={isSignedIn}
            exact
            mustBeSignedIn
            path="/"
            component={HomeView}
            config={state.app.config}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            mustBeSignedIn
            path="/profile/:section?"
            component={ProfileEditView}
            config={state.app.config}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            mustBeSignedIn
            path="/profile/select/:referenceField/:page[^\d+$]?"
            component={ProfileEditView}
            config={state.app.config}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            path="/sign-in/:token?"
            component={SignInView}
            config={state.app.config}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            mustBeSignedIn
            path="/sign-out"
            render={() => {
              actions.signOut()

              return <Redirect to="/" />
            }}
            config={state.app.config}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={DocumentEditView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:collection${REGEX_SLUG}/new/:section?`}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={DocumentEditView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:group${REGEX_SLUG}/:collection${REGEX_SLUG}/new/:section?`}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={DocumentEditView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:collection${REGEX_SLUG}/:documentId${REGEX_DOCUMENT_ID}/:section?`}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={DocumentEditView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:group${REGEX_SLUG}/:collection${REGEX_SLUG}/:documentId${REGEX_DOCUMENT_ID}/:section?`}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={DocumentListView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:collection${REGEX_SLUG}/:page${REGEX_NUMBER}?`}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={ReferenceSelectView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:collection${REGEX_SLUG}/new/select/:referenceField/:page${REGEX_NUMBER}?`}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={ReferenceSelectView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:collection${REGEX_SLUG}/:documentId${REGEX_DOCUMENT_ID}/select/:referenceField/:page${REGEX_NUMBER}?`}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={DocumentListView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:group${REGEX_SLUG}/:collection${REGEX_SLUG}/:page${REGEX_NUMBER}?`}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={ReferenceSelectView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:group${REGEX_SLUG}/:collection${REGEX_SLUG}/new/select/:referenceField/:page${REGEX_NUMBER}?`}
          />

          <Route
            isSignedIn={isSignedIn}
            exact
            component={ReferenceSelectView}
            config={state.app.config}
            mustBeSignedIn
            path={`/:group${REGEX_SLUG}/:collection${REGEX_SLUG}/:documentId${REGEX_DOCUMENT_ID}/select/:referenceField/:page${REGEX_NUMBER}?`}
          />

          <Route
            isSignedIn={isSignedIn}
            component={ErrorView}
            config={state.app.config}
          />
        </Switch>
      </Router>
    )
  }
}

export default connectRedux(
  apiActions,
  appActions,
  documentActions,
  userActions
)(App)
