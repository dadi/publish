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

    const documentEdit = (
      <DocumentEdit
        collection={collection}
        documentId={documentId}
        group={group}
        onPageTitle={this.handlePageTitle}
        section={section}
      />
    )

    // Returning an empty `div` if the container returns `null` to avoid seeing
    // the 404 page.
    return documentEdit || <div />
  }

  handlePageTitle(title) {
    // View should always control page title, as it has a direct relationship to route
    setPageTitle(title)
  }
}