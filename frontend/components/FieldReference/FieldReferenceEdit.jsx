'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {buildUrl} from 'lib/router'
import {getVisibleFields} from 'lib/fields'

import Style from 'lib/Style'
import styles from './FieldReference.css'

import Button from 'components/Button/Button'
import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type Reference.
 */
export default class FieldReferenceEdit extends Component {
  static propTypes = {
    /**
     * The name of the collection being edited, as per the URL.
     */
    collection: proptypes.string,

    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The schema of the API being used.
     */
    currentApi: proptypes.object,

    /**
     * The schema of the collection being edited.
     */
    currentCollection: proptypes.object,

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
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * a successful state. The function receives the name of the field and the
     * new value as arguments.
     */
    onChange: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * or from an error state. The function receives the name of the field, a
     * Boolean value indicating whether or not there's an error and finally the
     * new value of the field.
     */
    onError: proptypes.string,

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
    value: proptypes.bool
  }

  componentDidMount() {
    const {forceValidation, value} = this.props

    if (forceValidation) {
      this.validate(value)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {forceValidation, value} = this.props

    if (
      !prevProps.forceValidation && forceValidation ||
      !prevProps.value && value
    ) {
      this.validate(value)
    }
  }

  findFirstStringField(fields) {
    return Object.keys(fields)
      .map(key => Object.assign({}, fields[key], {key}))
      .find(field => field.type === 'String')
  }

  handleRemove() {
    const {name, onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, name, null)
    }
  }

  render() {
    const {
      collection,
      currentApi,
      currentCollection,
      displayName,
      documentId,
      error,
      group,
      forceValidation,
      name,
      onBuildBaseUrl,
      onChange,
      onError,
      required,
      schema,
      value
    } = this.props
    const referencedCollectionName = schema.settings && schema.settings.collection

    if (!referencedCollectionName) return null

    const referencedCollection = currentApi.collections.find(collection => {
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
        comment={comment}
        error={error}
        label={displayName}
      >
        {value && (
          <div class={styles['value-container']}>
            <div class={styles.values}>
              {values.map(value => {
                if (value._id) {
                  return (
                    <a
                      class={styles['value-link']}
                      href={`${referencedCollection._publishLink}/${value._id}`}
                    >
                      <span class={styles.value}>
                        {displayField && value[displayField] || `Referenced ${displayName}`}
                      </span>
                    </a>
                  )                  
                }

                return (
                  <span
                    class={styles.value}
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
          <div class={styles.placeholder}>
            <Button
              accent="neutral"
              href={editLink}
              size="small"
            >Select existing {displayName.toLowerCase()}</Button>
          </div>
        )}

        {!value && isReadOnly && (
          <div class={styles['value-container']}>
            <span class={styles.value}>
              None
            </span>
          </div>
        )}
      </Label>
    )
  }

  validate(value) {
    const {name, onError, required} = this.props
    const hasValidationErrors = required && !value

    if (typeof onError === 'function') {
      //onError.call(this, name, hasValidationErrors, value)
    }    
  }
}
