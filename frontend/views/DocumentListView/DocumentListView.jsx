'use strict'

import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'
import {route} from '@dadi/preact-router'
import {URLParams} from 'lib/util/urlParams'

import * as appActions from 'actions/appActions'
import * as documentsActions from 'actions/documentsActions'

import Button from 'components/Button/Button'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
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
  DELETE: 'BULK_ACTIONS_DELETE',
  PLACEHOLDER: 'BULK_ACTIONS_PLACEHOLDER'
}

class DocumentListView extends Component {
  constructor(props) {
    super(props)

    this.state.bulkActionSelected = BULK_ACTIONS.PLACEHOLDER
  }

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
    const {bulkActionSelected} = this.state
    const validBulkActionSelected = bulkActionSelected &&
      (bulkActionSelected !== BULK_ACTIONS.PLACEHOLDER)

    if (!validBulkActionSelected) return

    if (bulkActionSelected === BULK_ACTIONS.DELETE) {
      this.handleDocumentDelete(state.documents.selected)
    }
  }

  handleBulkActionSelect(event) {
    this.setState({
      bulkActionSelected: event.target.value
    })
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
            filters={search.filter}
            onBuildBaseUrl={onBuildBaseUrl.bind(this)}
            onPageTitle={setPageTitle}
            onRenderDocuments={props => (
              <DocumentTableList {...props} />
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
          <div>
            <select
              class={styles['bulk-action-select']}
              onChange={this.handleBulkActionSelect.bind(this)}
              value={bulkActionSelected}
            >
              <option
                disabled
                value={BULK_ACTIONS.PLACEHOLDER}
              >With selected...</option>
              <option value={BULK_ACTIONS.DELETE}>Delete</option>
            </select>

            <ButtonWithPrompt
              accent="data"
              disabled={(bulkActionSelected === BULK_ACTIONS.PLACEHOLDER) || !selectedDocuments.length}
              onClick={this.handleBulkActionApply.bind(this)}
              promptCallToAction={`Yes, delete ${selectedDocuments.length > 1 ? 'them' : 'it'}.`}
              promptMessage={`Are you sure you want to delete the selected ${selectedDocuments.length > 1 ? 'documents' : 'document'}?`}
              size="small"
            >Apply</ButtonWithPrompt>
          </div>        
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
