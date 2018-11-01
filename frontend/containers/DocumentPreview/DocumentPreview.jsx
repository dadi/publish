'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

/**
 * The interface for editing a document.
 */
class DocumentPreview extends Component {
  static propTypes = {
    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The collection to operate on.
     */
    document: proptypes.object
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {
      collection,
      document
    } = this.props

    try {
      const collectionFullName = `${collection.version}/${collection.database}/${collection.name}`
      const previewHTML = window.renderPreviewTemplate(collectionFullName, document) || 
                      'No preview available'
      return <div dangerouslySetInnerHTML={{__html: previewHTML}} />
    }
    catch(error) {
        console.log('Error while creating preview template: ', error)
        return 'No preview available'
    }
  }
}

export default DocumentPreview