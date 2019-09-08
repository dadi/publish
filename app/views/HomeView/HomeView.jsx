import * as userActions from 'actions/userActions'
import {connectRedux} from 'lib/redux'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import React from 'react'
import {setPageTitle} from 'lib/util'
import SpinningWheel from 'components/SpinningWheel/SpinningWheel'

class HomeView extends React.Component {
  render() {
    const {app, user} = this.props.state
    const {api} = app.config

    if (!user.isSignedIn) {
      return null
    }

    const hasAccessToCollections = api.collections.length > 0
    const message = hasAccessToCollections
      ? 'You can use the menu to navigate collections and start editing documents.'
      : 'You do not currently have access to any collections, please contact an administrator.'
    const displayName =
      user.remote['data.publishFirstName'] || user.remote.clientId

    setPageTitle()

    return (
      <main>
        {api.isLoading && <SpinningWheel />}

        {!api.isLoading && (
          <HeroMessage title={`Welcome, ${displayName}.`} subtitle={message} />
        )}
      </main>
    )
  }
}

export default connectRedux(userActions)(HomeView)
