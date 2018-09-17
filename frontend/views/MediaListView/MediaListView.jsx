'use strict'

import {Component, h} from 'preact'

import Style from 'lib/Style'
import styles from './MediaListView.css'

import {DocumentRoutes} from 'lib/document-routes'
import {isValidJSON, setPageTitle} from 'lib/util'

import DocumentList from 'containers/DocumentList/DocumentList'
import DocumentListController from 'containers/DocumentListController/DocumentListController'
import DocumentListToolbar from 'containers/DocumentListToolbar/DocumentListToolbar'
import Header from 'containers/Header/Header'
import Main from 'components/Main/Main'
import Page from 'components/Page/Page'
import ReferencedDocumentHeader from 'containers/ReferencedDocumentHeader/ReferencedDocumentHeader'

export default class MediaListView extends Component {
  constructor(props) {
    super(props)

    // If we have a valid filter when we mount the component for the first time,
    // then we start with the filters visible by default. Otherwise, they're
    // hidden.
    this.state.newFilter = false
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

    return (
      <Page>
        <Main>
          <div class={styles.container}>
            <DocumentListController
              collection={collection}
              group={group}
              filter={filter}
              newFilter={newFilter}
              onAddNewFilter={this.handleAddNewFilter.bind(this)}
              onGetRoutes={this.getRoutes.bind(this)}
              documentId={documentId}
              referencedField={referencedField}
            />
          </div>        
        </Main>
      </Page>
    )
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.collection !== this.props.collection) {
      this.setState({
        newFilter: false
      })
    }
  }

  handleAddNewFilter(isNewFilter) {
    this.setState({
      newFilter: isNewFilter
    })
  }

  getRoutes(paths) {
    return new DocumentRoutes(Object.assign(this.props, {paths}))
  }

  handleBuildBaseUrl(data = {}) {
    const {
      collection: bucket,
      documentId,
      group,
      referencedField
    } = this.props

    if (referencedField) {
      if (documentId) {
        return ['media', bucket, mediaId, data.section]
      }

      return ['media', bucket, 'new', data.section]
    }

    return ['media', bucket]
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
