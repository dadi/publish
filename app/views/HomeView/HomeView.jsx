import * as userActions from 'actions/userActions'
import {connectRedux} from 'lib/redux'
import Header from 'containers/Header/Header'
import React from 'react'
import {setPageTitle} from 'lib/util'
import SpinningWheel from 'components/SpinningWheel/SpinningWheel'
import styles from './HomeView.css'

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
      <>
        <Header />

        <main className={styles.main}>
          {api.isLoading && <SpinningWheel />}

          {!api.isLoading && (
            <div className={styles.container}>
              <h1>Welcome, {displayName}.</h1>
              <p>{message}</p>
            </div>
          )}
        </main>
      </>
    )
  }
}

export default connectRedux(userActions)(HomeView)
