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

    setPageTitle('New document')

    return (
      <DocumentEdit
        collection={collection}
        group={group}
        section={section}
      />
    )    
  }
}
