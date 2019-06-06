import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import {connectRedux} from 'lib/redux'
import SpinningWheel from 'components/SpinningWheel/SpinningWheel'
import proptypes from 'prop-types'
import React from 'react'

/**
 * The interface for editing a document.
 */
class Document extends React.Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The unique key that identifies the content being edited.
     */
    contentKey: proptypes.string,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * A callback to render an error message when the requested document could
     * not be found.
     */
    onDocumentNotFound: proptypes.func,

    /**
     * A callback to render the document when it is loaded successfully.
     * It is called with a single named parameter, `document`, containing
     * the document object.
     */
    onRender: proptypes.func,

    /**
     * The current active section (if any).
     */
    section: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  componentDidUpdate(oldProps) {
    const {contentKey, state} = this.props
    const {contentKey: oldContentKey} = oldProps
    const oldData = oldProps.state.document[contentKey] || {}
    const newData = state.document[contentKey] || {}
    const dataIsDirty = oldData.dirty === false && newData.dirty === true

    // If the component received a new content key or the data is dirty, which
    // may happen when documents are updated/deleted, we must fetch again.
    if ((contentKey !== oldContentKey) || dataIsDirty) {
      this.fetch()
    }
  }

  componentWillMount() {
    this.fetch()
  }

  fetch() {
    const {
      actions,
      collection,
      contentKey,
      documentId: id
    } = this.props

    if (typeof id === 'string') {
      actions.fetchDocument({
        contentKey,
        collection,
        id
      })
    }
  }

  render() {
    const {
      contentKey,
      documentId,
      onDocumentNotFound,
      onRender,
      state
    } = this.props
    const document = state.document[contentKey]

    if ((!document && documentId) || (document && document.isLoading)) {
      return (
        <SpinningWheel />
      )
    }

    const {local, remote, remoteError} = document || {}

    if (remoteError === 404) {
      if (typeof onDocumentNotFound === 'function') {
        return onDocumentNotFound({
          error: remoteError
        })
      }
      
      return null
    }

    if (typeof onRender !== 'function') {
      return null
    }

    return onRender({
      document: {
        ...document,
        _merged: {
          ...remote,
          ...local
        }
      }
    })
  }
}

export default connectRedux(
  appActions,
  documentActions
)(Document)
