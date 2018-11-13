'use strict'

import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'
import {URLParams} from 'lib/util/urlParams'

import * as appActions from 'actions/appActions'
import * as documentsActions from 'actions/documentsActions'

import Button from 'components/Button/Button'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'containers/DocumentListController/DocumentListController'
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
            href={onBuildBaseUrl({
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
          href={onBuildBaseUrl({
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
      filter,
      group,
      onBuildBaseUrl,
      order,
      page,
      sort,
      state
    } = this.props
    const {bulkActionSelected} = this.state
    const {newFilter} = this.state
    const {
      currentApi,
      currentCollection,
      currentParentCollection
    } = state.api
    const {
      list: documents,
      selected: selectedDocuments
    } = state.documents

    return (
      <Page>
        <Header
          currentCollection={currentCollection}
        />

        <Main>
          <DocumentListController
            api={currentApi}
            collection={currentCollection}
            documentId={documentId}
            filter={filter}
            newFilter={newFilter}
            onBuildBaseUrl={onBuildBaseUrl.bind(this)}
          />

          <DocumentList
            api={currentApi}
            collection={currentCollection}
            collectionParent={currentParentCollection}
            documentId={documentId}
            filter={filter}
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
          onBuildBaseUrl={onBuildBaseUrl.bind(this)}
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
    documents: state.documents
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...documentsActions
  }, dispatch)
)(DocumentListView)
