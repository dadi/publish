'use strict'

import {h, Component} from 'preact'

import {setPageTitle} from 'lib/util'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'

export default class DocumentCreateView extends Component {
  render() {
    const {
      collection,
      documentId,
      group,
      section
    } = this.props

    return (
      <Page>
        <Header />

        <Main>
          <DocumentEdit
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