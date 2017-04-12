'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'
import {buildUrl} from 'lib/router'

import * as apiActions from 'actions/apiActions'
import {connectHelper} from 'lib/util'
import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'

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
      parentDocumentId,
      referencedField,
      state
    } = this.props
    const parentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group
    })

    // Render nothing if we don't have the collection schema available.
    if (!parentCollection) return null

    const fieldSchema = parentCollection.fields[referencedField]
    
    // Render nothing if we don't have a matching field in the collection.
    if (!fieldSchema) return null

    const displayName = fieldSchema.label || referencedField
    const backToDocumentLink = parentDocumentId ? buildUrl(
      group,
      collection,
      'document',
      'edit',
      parentDocumentId
    ) : buildUrl(
      group,
      collection,
      'document',
      'new'
    )

    return (
      <div class={styles.container}>
        <p>
          <strong>{displayName}</strong>
          <span> — choose document to reference</span>
        </p>

        <Button
          accent="destruct"
          href={backToDocumentLink}
          size="small"
        >Nevermind, back to document</Button>
      </div>
    )
  }
}

export default connectHelper(
  state => ({
    api: state.api
  }),
  dispatch => bindActionCreators(apiActions, dispatch)
)(ReferencedDocumentHeader)
