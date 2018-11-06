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
import DocumentTableList from 'components/DocumentTableList/DocumentTableList'
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
          <Header
            currentCollection={currentCollection}
          />
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
              onPageTitle={setPageTitle}
              onRenderDocuments={props => (
                <DocumentTableList {...props} />
              )}
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
    search = new URLParams(window.location.search).toObject() || {},
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
      if (Object.keys(search).length > 0) {
        url += `?${new URLParams(search).toString()}`
      }
    }

    return `/${url}`
  }
}

export default connectHelper(
  state => ({
    api: state.api
  })
)(DocumentListView)
