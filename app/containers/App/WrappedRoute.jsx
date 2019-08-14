import * as Constants from '../../lib/constants'
import {buildUrl, decodeSearch} from '../../lib/util/url'
import {Redirect, Route} from 'react-router-dom'
import {connectRedux} from 'lib/redux'
import ErrorView from '../../views/ErrorView/ErrorView'
import React from 'react'

class WrappedRoute extends React.Component {
  UNSAFE_componentWillReceiveProps(newProps) {
    const {
      state: {
        user: {isSignedIn}
      },
      location: {search}
    } = this.props

    const {redirect} = decodeSearch(search)

    this.redirectUrl =
      !isSignedIn && newProps.state.user.isSignedIn ? redirect || '/' : null
  }

  render() {
    if (this.redirectUrl) return <Redirect to={this.redirectUrl} />

    const apiError = window.__error__

    if (apiError) {
      if (apiError.statusCode === 404) {
        window.__error__ = null

        return <Redirect to="/sign-in" />
      }

      return <ErrorView data={apiError} type={Constants.API_CONNECTION_ERROR} />
    }

    const {
      component: Component,
      isPublic,
      render,
      state: {
        user: {isSignedIn}
      },
      ...props
    } = this.props

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

export default connectRedux()(WrappedRoute)
