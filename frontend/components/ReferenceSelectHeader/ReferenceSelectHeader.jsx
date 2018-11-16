'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {Format} from 'lib/util/string'

import Style from 'lib/Style'
import styles from './ReferenceSelectHeader.css'

import Button from 'components/Button/Button'

/**
 * A header to be used when navigating referenced documents.
 */
export default class ReferenceSelectHeader extends Component {
  static propTypes = {
    /**
     * The text/elements to be rendered inside the header.
     */
    children: proptypes.node,

    /**
     * The parent collection to operate on, when dealing with a reference field.
     */
    collectionParent: proptypes.object,

    /**
     * The instructional text to display on the top-left corner of the header.
     */
    instructionText: proptypes.string,

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
     * The CTA text to display on the "return to document" button.
     */
    returnCtaText: proptypes.string,
  }

  static defaultProps = {
    instructionText: 'choose document to reference',
    returnCtaText: 'Nevermind, back to document'
  }

  render() {
    const {
      children,
      collectionParent,
      instructionText,
      onBuildBaseUrl,
      parentDocumentId,
      referencedField,
      returnCtaText
    } = this.props
    // Render nothing if we don't have the collection schema available.
    if (!collectionParent) return null

    const fieldSchema = collectionParent.fields[referencedField]

    // Render nothing if we don't have a matching field in the collection.
    if (!fieldSchema) return null

    const displayName = fieldSchema.label || referencedField
    const section = fieldSchema.publish &&
      fieldSchema.publish.section &&
      Format.slugify(fieldSchema.publish.section)
    const returnUrl = onBuildBaseUrl({
      createNew: false,//!Boolean(state.router.parameters.documentId),
      referencedField: null,
      section
    })

    return (
      <div class={styles.container}>
        <p>
          <strong>{displayName}</strong>
          <span> — {instructionText}</span>
        </p>

        <Button
          accent="destruct"
          href={returnUrl}
          size="small"
        >{returnCtaText}</Button>

        {children}
      </div>
    )
  }
}
