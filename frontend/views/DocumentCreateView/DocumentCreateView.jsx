'use strict'

import {h, Component} from 'preact'

import {setPageTitle} from 'lib/util'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'
import DocumentEditToolbar from 'containers/DocumentEditToolbar/DocumentEditToolbar'
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
            onBuildSectionUrl={this.handleBuildSectionUrl.bind(this)}
            onPageTitle={this.handlePageTitle}
            section={section}
          />
        </Main>

        <DocumentEditToolbar
          collection={collection}
          group={group}
          section={section}
        />        
      </Page>
    )    
  }

  handleBuildSectionUrl() {
    const {
      collection,
      documentId,
      group,
      section
    } = this.props

    return [group, collection, 'document', 'new']
  }

  handlePageTitle(title) {
    // View should always control page title, as it has a direct relationship to route
    setPageTitle(title)
  }
}