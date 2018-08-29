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

export default class DocumentCreateView extends Component {
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
        <Header
          onGetRoutes={this.getRoutes.bind(this)}
        />

        <Main>
          <DocumentEdit
            collection={collection}
            group={group}
            onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
            onGetRoutes={this.getRoutes.bind(this)}
            onPageTitle={this.handlePageTitle}
            section={section}
          />
        </Main>

        <DocumentEditToolbar
          collection={collection}
          group={group}
          onGetRoutes={this.getRoutes.bind(this)}
          section={section}
        />        
      </Page>
    )    
  }

  getRoutes(paths) {
    return new DocumentRoutes(Object.assign(this.props, {paths}))
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
      collection,
      'new'
    ]

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