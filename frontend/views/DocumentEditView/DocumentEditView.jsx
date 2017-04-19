'use strict'

import {h, Component} from 'preact'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'
import DocumentEditToolbar from 'containers/DocumentEditToolbar/DocumentEditToolbar'
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
      referencedField,
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
            onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
            onPageTitle={this.handlePageTitle}
            referencedField={referencedField}
            section={section}
          />
        </Main>

        <DocumentEditToolbar
          collection={collection}
          documentId={documentId}
          group={group}
          referencedField={referencedField}
          section={section}
        />
      </Page>
    )
  }

  handleBuildBaseUrl() {
    const {
      collection,
      documentId,
      group,
      section
    } = this.props

    return [group, collection, 'document', 'edit', documentId]
  }

  handlePageTitle(title) {
    // View should always control page title, as it has a direct relationship to route
    setPageTitle(title)
  }
}