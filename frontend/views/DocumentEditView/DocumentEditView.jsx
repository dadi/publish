'use strict'

import {h, Component} from 'preact'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'

import {setPageTitle} from 'lib/util'

export default class DocumentEditView extends Component {
  render() {
    const {
      collection,
      documentId,
      group,
      section
    } = this.props

    return (
      <DocumentEdit
        collection={collection}
        documentId={documentId}
        group={group}
        onPageTitle={this.handlePageTitle}
        section={section}
      />
    )    
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
