import {decodeSearch} from 'lib/util/url'
import React from 'react'
import {withRouter} from 'react-router'

export function connectRouter(WrappedComponent) {
  class Extractor extends React.Component {
    render() {
      const {history, location, match, ...componentProps} = this.props
      const search = decodeSearch(location.search)

      return (
        <WrappedComponent
          {...componentProps}
          router={{history, location, match, search}}
        />
      )
    }
  }

  return withRouter(Extractor)
}
