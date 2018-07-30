import {Component, h} from 'preact'
import {connect} from 'preact-redux'
import {setPageTitle} from 'lib/util'

import SignIn from 'containers/SignIn/SignIn'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'


export default class SignInView extends Component {
  render() {
    const {token} = this.props

    return (
      <Page>
        <Main>
          <SignIn 
            setPagetTitle={this.handlePageTitleChange}
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
