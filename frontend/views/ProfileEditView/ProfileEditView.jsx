'use strict'

import {h, Component} from 'preact'

import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import ProfileEdit from 'containers/ProfileEdit/ProfileEdit'

import {setPageTitle} from 'lib/util'

export default class ProfileEditView extends Component {
  render() {
    const {
      collection,
      group,
      section
    } = this.props

    return (
      <Page>
        <Header />

        <Main>
          <ProfileEdit
            collection={collection}
            group={group}
            onPageTitle={this.handlePageTitle}
            section={section}
          />
        </Main>
      </Page>
    ) 
  }

  handlePageTitle(title) {
    // View should always control page title, as it has a direct relationship to route
    setPageTitle(title)
  }
}