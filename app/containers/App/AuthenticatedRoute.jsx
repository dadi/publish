import * as Constants from '../../lib/constants'
import {buildUrl, decodeSearch} from '../../lib/util/url'
import {Redirect, Route} from 'react-router-dom'
import {connectRedux} from 'lib/redux'
import ErrorView from '../../views/ErrorView/ErrorView'
import React from 'react'

class AuthenticatedRoute extends React.Component {
  // Side effects in SCU—not ideal; feel free to rewrite if you have a better idea.
  shouldComponentUpdate(newProps) {
    const {isSignedIn} = newProps.state.user
    const {isSignedIn: wasSignedIn} = this.props.state.user
    const {search} = this.props.location
    const {redirect} = decodeSearch(search)

    this.redirectUrl = !wasSignedIn && isSignedIn ? redirect || '/' : null

    return true
  }

  render() {
    if (this.redirectUrl) return <Redirect to={this.redirectUrl} />

    const apiError = window.__error__

    if (apiError) {
      if (apiError.statusCode === 401 || apiError.statusCode === 404) {
        window.__error__ = null

        return <Redirect to="/sign-in" />
      }

      return <ErrorView data={apiError} type={Constants.API_CONNECTION_ERROR} />
    }

    const {component: Component, isPublic, render, state, ...props} = this.props
    const {isSignedIn} = state.user

    if (!isPublic && !isSignedIn) {
      const {pathname} = props.location
      const redirectUrl = {
        pathname: '/sign-in',
        search:
          pathname === '/' ? null : `?redirect=${encodeURIComponent(pathname)}`
      }

      return <Redirect to={redirectUrl} />
    }

    return (
      <Route
        {...props}
        render={({history, match, location}) => {
          const renderProps = {
            history,
            location,
            match,
            onBuildBaseUrl: buildUrl,
            route: {
              history,
              params: match.params,
              path: location.pathname,
              search: decodeSearch(location.search),
              searchString: location.search
            }
          }

          if (render) {
            return render(renderProps)
          }

          return <Component {...renderProps} />
        }}
      />
    )
  }
}

export default connectRedux()(AuthenticatedRoute)
