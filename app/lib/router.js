import {decodeSearch} from 'lib/util/url'
import React from 'react'
import {withRouter} from 'react-router-dom'

export function connectRouter(WrappedComponent) {
  class Extractor extends React.Component {
    render() {
      const {history, location, match, ...componentProps} = this.props

      const route = {
        history,
        params: match.params,
        path: location.pathname,
        search: decodeSearch(location.search),
        searchString: location.search
      }

      return <WrappedComponent {...componentProps} route={route} />
    }
  }

  return withRouter(Extractor)
}
