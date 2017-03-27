'use strict'

import {h, Component} from 'preact'

import {setPageTitle} from 'lib/util'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'

export default class DocumentCreateView extends Component {
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
        group={group}
        onPageTitle={this.handlePageTitle}
        section={section}
      />
    )    
  }
  handlePageTitle(title) {
    // View should always control page title, as it has a direct relationship to route
    setPageTitle(title)
  }
}