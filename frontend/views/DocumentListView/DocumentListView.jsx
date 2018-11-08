'use strict'

import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'
import {URLParams} from 'lib/util/urlParams'

import * as documentsActions from 'actions/documentsActions'

import Button from 'components/Button/Button'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'containers/DocumentListController/DocumentListController'
import DocumentListToolbar from 'containers/DocumentListToolbar/DocumentListToolbar'
import DocumentTableList from 'components/DocumentTableList/DocumentTableList'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import ReferencedDocumentHeader from 'containers/ReferencedDocumentHeader/ReferencedDocumentHeader'

class DocumentListView extends Component {
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

  handleDocumentDelete(ids) {
    const {actions, state} = this.props
    const {
      currentApi: api,
      currentCollection: collection
    } = state.api

    actions.deleteDocuments({
      api,
      collection,
      ids
    })
  }

  handleEmptyDocumentList() {
    const {
      filter,
      referencedField
    } = this.props

    if (filter) {
      return (
        <HeroMessage
          title="No documents found."
          subtitle="We can't find anything matching those filters."
        >
          <Button
            accent="system"
            href={this.handleBuildBaseUrl({
              search: {}
            })}
          >Clear filters</Button>
        </HeroMessage>
      )
    }

    return (
      <HeroMessage
        title="No documents yet."
        subtitle="Once created, they will appear here."
      >
        {!referencedField && (
          <Button
            accent="save"
            href={this.handleBuildBaseUrl({
              createNew: true
            })}
          >Create new document</Button>
        )}
      </HeroMessage>
    )    
  }

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
            onRenderEmptyDocumentList={this.handleEmptyDocumentList.bind(this)}
            order={order}
            page={page}
            referencedField={referencedField}
            sort={sort}
          />
        </Main>

        <DocumentListToolbar
          api={currentApi}
          collection={currentCollection}
          onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
          onDelete={this.handleDocumentDelete.bind(this)}
          referencedField={referencedField}
        />
      </Page>
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    documents: state.documents
  }),
  dispatch => bindActionCreators({
    ...documentsActions
  }, dispatch)
)(DocumentListView)
