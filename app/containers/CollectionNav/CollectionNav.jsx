import buildGroupedMenuItems from './buildGroupedMenuItems'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import Nav from 'components/Nav/Nav'
import React from 'react'

class CollectionNav extends React.Component {
  render() {
    const {
      route: {
        params: {collection}
      },
      state: {
        app: {
          breakpoint,
          config: {api}
        }
      }
    } = this.props

    return (
      <Nav
        items={buildGroupedMenuItems(api, collection)}
        mobile={breakpoint === null}
      />
    )
  }
}

export default connectRouter(connectRedux()(CollectionNav))
