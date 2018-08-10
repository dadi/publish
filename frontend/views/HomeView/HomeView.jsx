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
    const {user} = state

    if (user.status !== Constants.STATUS_IDLE) {
      return null
    }

    setPageTitle()

    return (
      <Page>
        <Header />

        <Main>
          <HeroMessage
            title={`Welcome, ${(user.remote.data && user.remote.data && user.remote.data.publishFirstName) || 'Guest'}.`}
            subtitle="You can use the menu to navigate collections and start editing documents."
          />
        </Main>
      </Page>
    )
  }
}

export default connectHelper(
  state => ({
    user: state.user
  }),
  dispatch => bindActionCreators(userActions, dispatch)
)(HomeView)
