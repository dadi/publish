import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'

import * as Constants from 'lib/constants'
import * as userActions from 'actions/userActions'

import * as documentsActions from 'actions/documentsActions'

import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentListToolbar from 'containers/DocumentListToolbar/DocumentListToolbar'
import Header from 'containers/Header/Header'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import Main from 'components/Main/Main'
import MediaGridCard from 'components/MediaGridCard/MediaGridCard'
import MediaListController from 'containers/MediaListController/MediaListController'
import Page from 'components/Page/Page'

class MediaListView extends Component {
  handleBuildBaseUrl() {
    return '/media'
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
    return (
      <DocumentGridList
        {...documentProps}
        onRenderCard={(item, onSelect, isSelected) => (
          <MediaGridCard
            item={item}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        )}
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
    const currentApi = state.api.apis[0]
    const currentCollection = {
      IS_MEDIA_BUCKET: true,
      _publishLink: '/media',
      fields: {}
    }

    return (
      <Page>
        <Header
          currentCollection={currentCollection}
        />

        <Main>
          <MediaListController
            api={currentApi}
          />

          <DocumentList
            api={currentApi}
            collection={currentCollection}
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
          api={currentApi}
          collection={currentCollection}
          onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
          onDelete={this.handleDelete.bind(this)}
        />
      </Page>
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    user: state.user
  }),
  dispatch => bindActionCreators({
    ...documentsActions
  }, dispatch)
)(MediaListView)
