'use strict'

import {Component, h} from 'preact'
import {bindActionCreators} from 'redux'
import {connectHelper, setPageTitle} from 'lib/util'
import {urlHelper} from 'lib/util/url-helper'

import Style from 'lib/Style'
import styles from './MediaListView.css'

import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'

import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'containers/DocumentListController/DocumentListController'
import DocumentListToolbar from 'containers/DocumentListToolbar/DocumentListToolbar'
import DropArea from 'components/DropArea/DropArea'
import FileUpload from 'components/FileUpload/FileUpload'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import ReferencedDocumentHeader from 'containers/ReferencedDocumentHeader/ReferencedDocumentHeader'

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
            <div class={styles.placeholder}>
              <div class={styles['upload-options']}>
                <DropArea
                  draggingText={`Drop image(s) here`}
                  onDrop={this.handleFileChange.bind(this)}
                >
                  <div class={styles['upload-drop']}>
                    Drop file(s) to upload
                  </div>
                </DropArea>
              </div>
              <div class={styles['upload-select']}>
                <span>or </span>
                <FileUpload
                  allowDrop={true}
                  accept="image/*;capture=camera"
                  multiple={true}
                  onChange={this.handleFileChange.bind(this)}
                />
              </div>
            </div>
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

  handleFileChange(files) {
    const {
      actions: {
        uploadMediaToBucket
      },
      collectionName,
      state
    } = this.props

    const api = state.api.apis[0]
    const collection = {
      _media: collectionName || true,
      fields: {
        fileName: {
          label: 'Filename'
        }
      },
      name: 'Media'
    }

    uploadMediaToBucket(
      {
        api,
        bucket: 'mediaStore',
        files
      }
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
  }),
  dispatch => bindActionCreators({
    ...documentActions,
    ...documentsActions
  }, dispatch)
)(MediaListView)
