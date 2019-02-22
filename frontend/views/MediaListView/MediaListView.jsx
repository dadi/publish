import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'

import * as Constants from 'lib/constants'
import * as userActions from 'actions/userActions'

import * as appActions from 'actions/appActions'
import * as documentsActions from 'actions/documentsActions'

import BulkActionSelector from 'components/BulkActionSelector/BulkActionSelector'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import MediaGridCard from 'containers/MediaGridCard/MediaGridCard'
import MediaListController from 'containers/MediaListController/MediaListController'
import Page from 'components/Page/Page'
import Style from 'lib/Style'
import styles from './MediaListView.css'

const BULK_ACTIONS = {
  DELETE: 'BULK_ACTIONS_DELETE'
}

class MediaListView extends Component {
  componentDidUpdate(prevProps, prevState) {
    const {actions, state} = this.props
    const {isDeleting, list} = state.documents
    const wasDeleting = prevProps.state.documents.isDeleting

    // Have we just deleted some documents?
    if (wasDeleting && !isDeleting) {
      let message = wasDeleting > 1 ?
        `${wasDeleting} media items have been deleted` :
        'The media item has been deleted'

      actions.setNotification({
        message
      })
    }
  }

  handleBuildBaseUrl({
    page
  }) {
    let url = ['/media']

    if (page) {
      url.push(page)
    }

    return url.join('/')
  }

  handleBulkActionApply(actionType) {
    const {state} = this.props

    if (actionType === BULK_ACTIONS.DELETE) {
      this.handleDelete(state.documents.selected)
    }
  }

  handleDelete(ids) {
    const {actions, state} = this.props
    const api = state.api.apis[0]

    actions.deleteMedia({
      api,
      ids
    })
  }

  handleEmptyDocumentList() {
    const {
      referencedField
    } = this.props

    return (
      <HeroMessage
        title="No media yet."
        subtitle="Once you upload media files, they will appear here."
      />
    )    
  }

  handleRenderDocument(documentProps) {
    const {page, state} = this.props
    const {config} = state.app

    return (
      <DocumentGridList
        {...documentProps}
        onRenderCard={(item, onSelect, isSelected) => {
          if (config.cdn && config.cdn.publicUrl) {
            item.url = `${config.cdn.publicUrl}${item.path}?width=500`
          }

          return (
            <MediaGridCard
              href={`/media/${item._id}`}
              item={item}
              isSelected={isSelected}
              onSelect={onSelect}
            />
          )
        }}
      />
    )
  }

  handlePageTitle() {
    setPageTitle('Media')
  }

  render() {
    const {
      order,
      page,
      sort,
      state
    } = this.props
    const {bulkActionSelected} = this.state
    const currentApi = state.api.apis[0]
    const {
      list: documents,
      selected: selectedDocuments
    } = state.documents

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
        <Header
          currentCollection={Constants.MEDIA_COLLECTION_SCHEMA}
        />

        <Main>
          <MediaListController
            api={currentApi}
          />

          <DocumentList
            api={currentApi}
            collection={Constants.MEDIA_COLLECTION_SCHEMA}
            onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
            onPageTitle={this.handlePageTitle}
            onRenderDocuments={this.handleRenderDocument.bind(this)}
            onRenderEmptyDocumentList={this.handleEmptyDocumentList.bind(this)}
            order={order}
            page={page}
            sort={sort}
          />      
        </Main>

        <DocumentListToolbar
          documentsMetadata={documents && documents.metadata}
          onBuildPageUrl={page => this.handleBuildBaseUrl({
            page
          })}
        >
          <BulkActionSelector
            actions={actions}
            className={styles['bulk-action-select']}
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
    app: state.app,
    documents: state.documents,
    user: state.user
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...documentsActions
  }, dispatch)
)(MediaListView)
