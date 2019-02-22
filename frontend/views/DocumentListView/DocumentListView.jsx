'use strict'

import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'
import {getVisibleFields} from 'lib/fields'
import {route} from '@dadi/preact-router'
import {URLParams} from 'lib/util/urlParams'

import * as appActions from 'actions/appActions'
import * as Constants from 'lib/constants'
import * as documentsActions from 'actions/documentsActions'

import Button from 'components/Button/Button'
import BulkActionSelector from 'components/BulkActionSelector/BulkActionSelector'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'components/DocumentListController/DocumentListController'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import DocumentTableList from 'components/DocumentTableList/DocumentTableList'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import Style from 'lib/Style'
import styles from './DocumentListView.css'

const BULK_ACTIONS = {
  DELETE: 'BULK_ACTIONS_DELETE'
}

class DocumentListView extends Component {
  componentDidUpdate(prevProps, prevState) {
    const {actions, state} = this.props
    const {isDeleting, list} = state.documents
    const wasDeleting = prevProps.state.documents.isDeleting

    // Have we just deleted some documents?
    if (wasDeleting && !isDeleting) {
      let message = wasDeleting > 1 ?
        `${wasDeleting} documents have been deleted` :
        'The document has been deleted'

      actions.setNotification({
        message
      })
    }
  }

  componentWillUpdate(nextProps) {
    const {onBuildBaseUrl} = this.props
    const {metadata} = nextProps.state.documents.list || {}
    const {page, totalPages} = metadata || {}

    if (page && totalPages && page > totalPages && !this.isRedirecting) {
      this.isRedirecting = true

      let redirectUrl = onBuildBaseUrl.call(this, {
        page: totalPages
      })

      route(redirectUrl)
    }
  }

  handleBulkActionApply(actionType) {
    const {state} = this.props

    switch (actionType) {
      case BULK_ACTIONS.DELETE:
        this.handleDocumentDelete(state.documents.selected)
        break
      default:
        return
    }
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
      onBuildBaseUrl
    } = this.props

    if (filter) {
      return (
        <HeroMessage
          title="No documents found."
          subtitle="We can't find anything matching those filters."
        >
          <Button
            accent="system"
            href={onBuildBaseUrl.call(this, {
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
        <Button
          accent="save"
          href={onBuildBaseUrl.call(this, {
            createNew: true
          })}
        >Create new document</Button>
      </HeroMessage>
    )    
  }

  render() {
    const {
      collection,
      documentId,
      group,
      onBuildBaseUrl,
      order,
      page,
      sort,
      state
    } = this.props
    const {bulkActionSelected} = this.state
    const {
      currentApi,
      currentCollection,
      currentParentCollection
    } = state.api
    const {
      list: documents,
      selected: selectedDocuments
    } = state.documents
    const {
      search = {}
    } = state.router
    const visibleFields = currentCollection && Object.keys(
      getVisibleFields({
        fields: currentCollection.fields,
        viewType: 'list'
      })
    ).concat(Constants.DEFAULT_FIELDS)

    const actions = {
      [BULK_ACTIONS.DELETE]: {
        confirmationMessage: 
          `Are you sure you want to delete the selected ${selectedDocuments.length > 1 ?
            'documents' :
            'document'}?`,
        ctaMessage: `Yes, delete ${selectedDocuments.length > 1 ? 'them' : 'it'}.`,
        disabled: !selectedDocuments.length,
        label: `Delete ${selectedDocuments.length ? ' (' + selectedDocuments.length + ')' : ''}`
      }
    }

    return (
      <Page>
        <Header currentCollection={currentCollection}>
          <DocumentListController
            collection={currentCollection}
            createNewHref={onBuildBaseUrl.call(this, {
              createNew: true,
              search: null
            })}
            enableFilters={true}
            onBuildBaseUrl={onBuildBaseUrl.bind(this)}
            search={search}
          />
        </Header>

        <Main>
          <DocumentList
            api={currentApi}
            collection={currentCollection}
            collectionParent={currentParentCollection}
            documentId={documentId}
            fields={visibleFields}
            filters={search.filter}
            onBuildBaseUrl={onBuildBaseUrl.bind(this)}
            onPageTitle={setPageTitle}
            onRenderDocuments={props => (
              <DocumentTableList
                {...props}
                fields={visibleFields}
              />
            )}
            onRenderEmptyDocumentList={this.handleEmptyDocumentList.bind(this)}
            order={order}
            page={page}
            sort={sort}
          />
        </Main>

        <DocumentListToolbar
          documentsMetadata={documents && documents.metadata}
          onBuildPageUrl={page => onBuildBaseUrl.call(this, {
            page
          })}
        >
          <BulkActionSelector
            actions={actions}
            onChange={this.handleBulkActionApply.bind(this)}
            selection={selectedDocuments}
          />
        </DocumentListToolbar>
      </Page>
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    documents: state.documents,
    router: state.router
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...documentsActions
  }, dispatch)
)(DocumentListView)
