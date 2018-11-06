import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'

import * as Constants from 'lib/constants'
import * as userActions from 'actions/userActions'

import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentGridList from 'components/DocumentGridList/DocumentGridList'
import DocumentListToolbar from 'containers/DocumentListToolbar/DocumentListToolbar'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import MediaGridCard from 'components/MediaGridCard/MediaGridCard'
import MediaListController from 'containers/MediaListController/MediaListController'
import Page from 'components/Page/Page'

class MediaListView extends Component {
  handleBuildBaseUrl() {
    return '/media'
  }

  handlePageTitle() {

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

    setPageTitle('Media')

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
            onRenderDocuments={props => (
              <DocumentGridList
                {...props}
                onRenderCard={document => (
                  <MediaGridCard item={document} />
                )}
              />
            )}
            order={order}
            page={page}
            sort={sort}
          />      
        </Main>

        <DocumentListToolbar
          api={currentApi}
          collection={currentCollection}
          onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
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
  dispatch => bindActionCreators(userActions, dispatch)
)(MediaListView)
