import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'

import * as Constants from 'lib/constants'
import * as userActions from 'actions/userActions'

import * as documentsActions from 'actions/documentsActions'

import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentListToolbar from 'components/DocumentListToolbar/DocumentListToolbar'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import MediaGridCard from 'components/MediaGridCard/MediaGridCard'
import MediaListController from 'containers/MediaListController/MediaListController'
import Page from 'components/Page/Page'
import Style from 'lib/Style'
import styles from './MediaListView.css'

const BULK_ACTIONS = {
  DELETE: 'BULK_ACTIONS_DELETE',
  PLACEHOLDER: 'BULK_ACTIONS_PLACEHOLDER'
}

class MediaListView extends Component {
  constructor(props) {
    super(props)

    this.state.bulkActionSelected = BULK_ACTIONS.PLACEHOLDER
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
              <option value="delete">Delete</option>
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
    app: state.app,
    documents: state.documents,
    user: state.user
  }),
  dispatch => bindActionCreators({
    ...documentsActions
  }, dispatch)
)(MediaListView)
