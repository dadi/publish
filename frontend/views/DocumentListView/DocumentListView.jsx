'use strict'

import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'
import {URLParams} from 'lib/util/urlParams'

import Style from 'lib/Style'
import styles from './DocumentListView.css'

import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'containers/DocumentListController/DocumentListController'
import DocumentListToolbar from 'containers/DocumentListToolbar/DocumentListToolbar'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import ReferencedDocumentHeader from 'containers/ReferencedDocumentHeader/ReferencedDocumentHeader'

class DocumentListView extends Component {
  render() {
    const {
      collection,
      documentId,
      filter,
      group,
      order,
      page,
      referencedField,
      sort,
      state
    } = this.props
    const {newFilter} = this.state
    const {
      currentApi,
      currentCollection,
      currentParentCollection
    } = state.api

    return (
      <Page>
        {referencedField ?
          <ReferencedDocumentHeader
            collectionParent={currentParentCollection}
            onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
            documentId={documentId}
            referencedField={referencedField}
          /> : 
          <Header/>
        }

        <Main>
          <div class={styles.container}>
            <DocumentListController
              api={currentApi}
              collection={currentCollection}
              documentId={documentId}
              filter={filter}
              newFilter={newFilter}
              onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
              referencedField={referencedField}
            />

            <DocumentList
              api={currentApi}
              collection={currentCollection}
              collectionParent={currentParentCollection}
              documentId={documentId}
              filter={filter}
              onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
              onPageTitle={this.handlePageTitle}
              order={order}
              page={page}
              referencedField={referencedField}
              sort={sort}
            />
          </div>        
        </Main>

        <DocumentListToolbar
          api={currentApi}
          collection={currentCollection}
          onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
          referencedField={referencedField}
        />
      </Page>
    )
  }

  handleBuildBaseUrl ({
    collection = this.props.collection,
    createNew,
    documentId = this.props.documentId,
    group = this.props.group,
    referenceFieldSelect,
    page,
    search = new URLParams(window.location.search).toObject(),
    section = this.props.section
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

    if (page) {
      urlNodes.push(page)
    }

    let url = urlNodes.filter(Boolean).join('/')

    if (!documentId) {
      if (search && Object.keys(search).length > 0) {
        url += `?${new URLParams(search).toString()}`
      }
    }

    return `/${url}`
  }

  handlePageTitle (title) {
    // We could have containers calling `setPageTitle()` directly, but it should
    // be up to the views to control the page title, otherwise we'd risk having
    // multiple containers wanting to set their own titles. Instead, containers
    // have a `onPageTitle` callback that they fire whenever they want to set
    // the title of the page. It's then up to the parent view to decide which
    // of those callbacks will set the title.

    setPageTitle(title)
  }
}

export default connectHelper(
  state => ({
    api: state.api
  })
)(DocumentListView)
