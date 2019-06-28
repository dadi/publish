import Button from 'components/Button/Button'
import {getVisibleFields} from 'lib/fields'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
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
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onSave` callback with the store. That callback is then
     * fired before the field is saved, allowing the function to modify its
     * value before it is persisted.
     */
    onSaveRegister: proptypes.func,

    /**
     * A callback to be fired when the components mounts, in case it wishes to
     * register an `onValidate` callback with the store. That callback is then
     * fired when the field is validated, overriding the default validation
     * method introduced by the API validator module.
     */
    onValidateRegister: proptypes.func,

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
        proptypes.oneOfType([proptypes.object, proptypes.string])
      ),
      proptypes.object,
      proptypes.string
    ])
  }

  componentDidMount() {
    const {onValidateRegister} = this.props

    if (typeof onValidateRegister === 'function') {
      onValidateRegister(this.validate.bind(this))
    }
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
    const referencedCollectionName =
      schema.settings && schema.settings.collection

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
      createNew: !documentId,
      referenceFieldSelect: name
    })
    const values = value && !(value instanceof Array) ? [value] : value
    const publishBlock = schema.publish || {}
    const isReadOnly = publishBlock.readonly === true
    const comment =
      schema.comment || (required && 'Required') || (isReadOnly && 'Read only')

    return (
      <Label comment={comment || null} error={error} label={displayName}>
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
                      <div className={styles.value}>
                        {(displayField && value[displayField]) ||
                          `Referenced ${displayName}`}
                      </div>
                    </a>
                  )
                }

                return (
                  <span className={styles.value} key={index} title={value}>
                    Document not found
                  </span>
                )
              })}
            </div>

            <div className={styles.buttons}>
              {!isReadOnly && (
                <Button
                  accent="data"
                  className={styles['control-button']}
                  href={editLink}
                  size="small"
                >
                  Edit
                </Button>
              )}

              {!isReadOnly && (
                <Button
                  accent="destruct"
                  className={styles['control-button']}
                  onClick={this.handleRemove.bind(this)}
                  size="small"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        )}

        {!value && !isReadOnly && (
          <div className={styles.placeholder}>
            <Button accent="neutral" href={editLink} size="small">
              Select existing {displayName.toLowerCase()}
            </Button>
          </div>
        )}

        {!value && isReadOnly && (
          <div className={styles['value-container']}>
            <span className={styles.value}>None</span>
          </div>
        )}
      </Label>
    )
  }

  validate({validateFn, value}) {
    const arrayValue = Array.isArray(value) ? value : [value]
    const allValuesAreUploads = arrayValue.every(value => {
      return value && value._previewData && value._file
    })

    // If we're looking at a media file that the user is trying to upload,
    // there's no point in sending it to the validator module because it
    // is in a format that the module will not understand, causing the
    // validation to fail.
    if (allValuesAreUploads) {
      return Promise.resolve()
    }

    return validateFn(value)
  }
}
