import {connectRedux} from 'lib/redux'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import React from 'react'
import {Redirect} from 'react-router-dom'
import {setPageTitle} from 'lib/util'
import SignIn from 'containers/SignIn/SignIn'

class SignInView extends React.Component {
  render() {
    const {state, token} = this.props
    const {isSignedIn} = state.user

    if (isSignedIn) {
      return <Redirect to="/" />
    }

    return (
      <Page>
        <Main>
          <SignIn setPageTitle={this.handlePageTitleChange} token={token} />
        </Main>
      </Page>
    )
  }

  handlePageTitleChange(title) {
    setPageTitle(title)
  }
}

export default connectRedux()(SignInView)
