'use strict'

import {h, Component} from 'preact'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'

import {setPageTitle} from 'lib/util'

export default class DocumentEditView extends Component {
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
            documentId={documentId}
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