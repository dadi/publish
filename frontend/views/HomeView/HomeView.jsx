import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'

import * as userActions from 'actions/userActions'

import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'

class HomeView extends Component {
  render() {
    const {state} = this.props
    const user = state.user.remote

    if (!user) return null

    setPageTitle()

    return (
      <Page>
        <Header />

        <Main>
          <HeroMessage
            title={`Welcome, ${(user && !user.error) ? user.first_name : 'Guest'}.`}
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
