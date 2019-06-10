import Button from 'components/Button/Button'
import proptypes from 'prop-types'
import React from 'react'
import styles from './ReferenceSelectHeader.css'

/**
 * A header to be used when navigating referenced documents.
 */
export default class ReferenceSelectHeader extends React.Component {
  static propTypes = {
    /**
     * The text/elements to be rendered inside the header.
     */
    children: proptypes.node,

    /**
     * The instructional text to display on the top-left corner of the
     * header.
     */
    instructionText: proptypes.string,

    /**
     * The schema of a reference field currently being edited.
     */
    referenceField: proptypes.object,

    /**
     * The CTA text to display on the "return to document" button.
     */
    returnCtaText: proptypes.string,

    /**
     * The URL of the "return to document" CTA button.
     */
    returnCtaUrl: proptypes.string
  }

  static defaultProps = {
    instructionText: 'choose document to reference',
    returnCtaText: 'Nevermind, back to document'
  }

  render() {
    const {
      children,
      instructionText,
      referenceField,
      returnCtaText,
      returnCtaUrl
    } = this.props

    if (!referenceField) return null

    const displayName = referenceField.label || referenceField

    return (
      <div className={styles.container}>
        <p>
          <strong>{displayName}</strong>
          <span> — {instructionText}</span>
        </p>

        <Button accent="destruct" href={returnCtaUrl} size="small">
          {returnCtaText}
        </Button>

        {children}
      </div>
    )
  }
}