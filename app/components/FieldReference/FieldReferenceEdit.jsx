import React from 'react'
import {getVisibleFields} from 'lib/fields'
import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import styles from './FieldReference.css'

/**
 * Component for API fields of type Reference.
 */
export default class FieldReferenceEdit extends React.Component {
  static propTypes = {
    /**
     * The schema of the collection being edited.
     */
    collection: proptypes.object,

    /**
     * The application configuration object.
     */
    config: proptypes.object,

    /**
     * The human-friendly name of the field, to be displayed as a label.
     */
    displayName: proptypes.string,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * If defined, contains an error message to be displayed by the field.
     */
    error: proptypes.string,

    /**
     * Whether the field should be validated as soon as it mounts, rather than
     * waiting for a change event.
     */
    forceValidation: proptypes.bool,

    /**
     * The name of the field within the collection. May be a path using
     * dot-notation.
     */
    name: proptypes.string,

    /**
     * A callback to be fired whenever the value of the field changes. The
     * function will be called with the updated value as the first argument
     * and an optional error message as the second. This second argument gives
     * each field component the ability to perform their own validaton logic,
     * in addition to the central validation routine taking place upstream.
     */
    onChange: proptypes.func,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * or from an error state. The function receives the name of the field, a
     * Boolean value indicating whether or not there's an error and finally the
     * new value of the field.
     */
    onError: proptypes.func,

    /**
     * Whether the field is required.
     */
    required: proptypes.bool,

    /**
     * The field schema.
     */
    schema: proptypes.object,
    
    /**
     * The field value.
     */
    value: proptypes.oneOfType([
      proptypes.arrayOf(
        proptypes.oneOfType([
          proptypes.object,
          proptypes.string
        ])        
      ),
      proptypes.object,
      proptypes.string
    ])
  }

  findFirstStringField(fields) {
    return Object.keys(fields)
      .map(key => Object.assign({}, fields[key], {key}))
      .find(field => field.type === 'String')
  }

  handleRemove() {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, null)
    }
  }

  render() {
    const {
      config,
      displayName,
      documentId,
      error,
      name,
      onBuildBaseUrl,
      required,
      schema,
      value
    } = this.props
    const referencedCollectionName = schema.settings && schema.settings.collection

    if (!referencedCollectionName) return null

    const {api} = config

    const referencedCollection = api.collections.find(collection => {
      return collection.slug === referencedCollectionName
    })

    if (!referencedCollection) return null

    const displayableFields = getVisibleFields({
      fields: referencedCollection.fields,
      viewType: 'list'
    })
    const firstStringField = this.findFirstStringField(displayableFields)
    const displayField = value && firstStringField ? firstStringField.key : null
    const editLink = onBuildBaseUrl({
      createNew: !Boolean(documentId),
      referenceFieldSelect: name
    })
    const values = value && !(value instanceof Array) ? [value] : value
    const publishBlock = schema.publish || {}
    const isReadOnly = publishBlock.readonly === true
    const comment = schema.comment ||
      required && 'Required' ||
      isReadOnly && 'Read only'

    return (
      <Label
        comment={comment || null}
        error={error}
        label={displayName}
      >
        {value && (
          <div className={styles['value-container']}>
            <div className={styles.values}>
              {values.map((value, index) => {
                if (value._id) {
                  return (
                    <a
                      className={styles['value-link']}
                      href={`${referencedCollection._publishLink}/${value._id}`}
                      key={value._id}
                    >
                      <span className={styles.value}>
                        {displayField && value[displayField] || `Referenced ${displayName}`}
                      </span>
                    </a>
                  )                  
                }

                return (
                  <span
                    className={styles.value}
                    key={index}
                    title={value}
                  >
                    Document not found
                  </span>
                )
              })}
            </div>

            {!isReadOnly && (
              <Button
                accent="data"
                className={styles['control-button']}
                href={editLink}
                size="small"
              >Edit</Button>
            )}

            {!isReadOnly && (
              <Button
                accent="destruct"
                className={styles['control-button']}
                onClick={this.handleRemove.bind(this)}
                size="small"
              >Remove</Button>
            )}
          </div>
        )}

        {!value && !isReadOnly && (
          <div className={styles.placeholder}>
            <Button
              accent="neutral"
              href={editLink}
              size="small"
            >Select existing {displayName.toLowerCase()}</Button>
          </div>
        )}

        {!value && isReadOnly && (
          <div className={styles['value-container']}>
            <span className={styles.value}>
              None
            </span>
          </div>
        )}
      </Label>
    )
  }
}
