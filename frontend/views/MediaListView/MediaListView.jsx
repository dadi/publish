'use strict'

import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'
import {urlHelper} from 'lib/util/url-helper'

import Style from 'lib/Style'
import styles from './MediaListView.css'

import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'containers/DocumentListController/DocumentListController'
import DocumentListToolbar from 'containers/DocumentListToolbar/DocumentListToolbar'
import Header from 'containers/Header/Header'

import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import FileUploadMedia from 'components/FileUploadMedia/FileUploadMedia'

class MediaListView extends Component {
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
    const currentApi = state.api.apis[0]
    const currentCollection = {
      _media: collection || true,
      fields: {
        fileName: {
          label: 'Filename'
        }
      },
      name: 'Media'
    }

    return (
      <Page>
        <Header/>
        <Main>
          <div class={styles.container}>
            <DocumentListController
              api={currentApi}
              collection={currentCollection}
              onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
              referencedField={true}
            />
            <FileUploadMedia
              bucket="mediaStore"
            />
            <div style="position:relative">
              <DocumentList
                api={currentApi}
                collection={currentCollection}
                onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
                onPageTitle={this.handlePageTitle}
                order={order}
                page={page}
                sort={sort}
              />
            </div>
          </div>
        </Main>

        <DocumentListToolbar
          api={currentApi}
          collection="mediaStore"
          onBuildBaseUrl={this.handleBuildBaseUrl.bind(this)}
        />
      </Page>
    )
  }

  handleBuildBaseUrl({
    collection = this.props.collection,
    documentId = this.props.documentId
  } = {}) {
    let urlNodes = [
      'media',
      collection,
      documentId
    ]

    let url = urlNodes.filter(Boolean).join('/')

    return `/${url}`
  } 

  handlePageTitle(title) {
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
)(MediaListView)
