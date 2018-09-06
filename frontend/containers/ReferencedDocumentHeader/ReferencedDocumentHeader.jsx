'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'

import * as apiActions from 'actions/apiActions'
import {connectHelper} from 'lib/util'
import {Format} from 'lib/util/string'

import Style from 'lib/Style'
import styles from './ReferencedDocumentHeader.css'

import Button from 'components/Button/Button'

/**
 * A header to be used when navigating referenced documents.
 */
class ReferencedDocumentHeader extends Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

    /**
     * The name of the collection currently being listed.
     */
    collection: proptypes.string,

    /**
     * The name of the group where the current collection belongs (if any).
     */
    group: proptypes.string,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * The name of a reference field currently being edited.
     */
    referencedField: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  render() {
    const {
      collection,
      group,
      onBuildBaseUrl,
      parentDocumentId,
      referencedField,
      state
    } = this.props
    const {currentParentCollection} = state.api

    // Render nothing if we don't have the collection schema available.
    if (!currentParentCollection) return null

    const fieldSchema = currentParentCollection.fields[referencedField]
    
    // Render nothing if we don't have a matching field in the collection.
    if (!fieldSchema) return null

    const displayName = fieldSchema.label || referencedField
    const returnUrl = onBuildBaseUrl({
      createNew: !Boolean(state.router.parameters.documentId)
    })

    return (
      <div class={styles.container}>
        <p>
          <strong>{displayName}</strong>
          <span> — choose document to reference</span>
        </p>

        <Button
          accent="destruct"
          href={returnUrl}
          size="small"
        >Nevermind, back to document</Button>
      </div>
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    router: state.router
  }),
  dispatch => bindActionCreators(apiActions, dispatch)
)(ReferencedDocumentHeader)
