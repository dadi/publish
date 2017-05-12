import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {setPageTitle} from 'lib/util'

import SignIn from 'containers/SignIn/SignIn'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'


export default class SignInView extends Component {
  render() {
    const {method, token} = this.props
    const isTokenSignin = (method === 'reset')

    return (
      <Page>
        <Header />
        <Main>
          <SignIn 
            setPagetTitle={this.handlePageTitleChange}
            isTokenSignin={isTokenSignin}
            token={token}
          />
        </Main>
      </Page>
    )
  }

  handlePageTitleChange (title) {
    setPageTitle(title)
  }
}
