'use strict'

import {h, Component} from 'preact'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'
import DocumentEditToolbar from 'containers/DocumentEditToolbar/DocumentEditToolbar'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'

import {DocumentRoutes} from 'lib/document-routes'
import {setPageTitle} from 'lib/util'
import {urlHelper} from 'lib/util/url-helper'

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
        <Header/>

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
          onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
          referencedField={referencedField}
          section={section}
        />
      </Page>
    )
  }

  handleBuildBaseUrl({
    collection = this.props.collection,
    createNew,
    documentId = this.props.documentId,
    group = this.props.group,
    referenceFieldSelect,
    search = urlHelper().paramsToObject(window.location.search),
    section =  this.props.section
  } = {}) {
    let urlNodes = [
      group,
      collection
    ]

    if (createNew) {
      urlNodes.push('new')
    } else {
      urlNodes.push(documentId)
    }

    if (referenceFieldSelect) {
      urlNodes = urlNodes.concat(['select', referenceFieldSelect])
    } else {
      urlNodes.push(section)
    }

    let url = urlNodes.filter(Boolean).join('/')

    if (search) {
      let searchString = urlHelper().paramsToString(search)

      url += `?${searchString}`
    }

    return `/${url}`
  }

  handlePageTitle(title) {
    // View should always control page title, as it has a direct relationship to route
    setPageTitle(title)
  }
}