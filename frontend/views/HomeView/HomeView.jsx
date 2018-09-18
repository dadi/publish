import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'

import * as Constants from 'lib/constants'
import * as userActions from 'actions/userActions'

import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'

class HomeView extends Component {
  render() {
    const {state} = this.props
    const {api, user} = state

    if (!user.isSignedIn) {
      return null
    }

    let hasAccessToCollections = api.currentApi &&
      api.currentApi.collections.length > 0
    let message = hasAccessToCollections ?
      'You can use the menu to navigate collections and start editing documents.' :
      'You do not currently have access to any collections, please contact an administrator.'

    setPageTitle()

    return (
      <Page>
        <Header />

        <Main>
          <HeroMessage
            title={`Welcome, ${(user.remote.data && user.remote.data && user.remote.data.publishFirstName) || 'Guest'}.`}
            subtitle={message}
          />
        </Main>
      </Page>
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    user: state.user
  }),
  dispatch => bindActionCreators(userActions, dispatch)
)(HomeView)
