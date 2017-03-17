'use strict'

import {h, Component} from 'preact'

import DocumentEdit from 'containers/DocumentEdit/DocumentEdit'

export default class DocumentEditView extends Component {
  render() {
    const {
      collection,
      documentId,
      group,
      method,
      section
    } = this.props

    return (
      <DocumentEdit
        collection={collection}
        documentId={documentId}
        group={group}
        section={section}
      />
    )    
  }  
}
