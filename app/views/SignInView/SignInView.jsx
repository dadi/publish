import {connectRedux} from 'lib/redux'
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
      <main>
        <SignIn setPageTitle={this.handlePageTitleChange} token={token} />
      </main>
    )
  }

  handlePageTitleChange(title) {
    setPageTitle(title)
  }
}

export default connectRedux()(SignInView)
