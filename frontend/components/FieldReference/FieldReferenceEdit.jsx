'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {buildUrl} from 'lib/router'
import {filterVisibleFields} from 'lib/fields'

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

  findFirstStringField(fields) {
    return Object.keys(fields)
      .map(key => Object.assign({}, fields[key], {key}))
      .find(field => field.type === 'String')
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
      schema,
      value
    } = this.props
    const referencedCollectionName = schema.settings && schema.settings.collection

    if (!referencedCollectionName) return null

    const referencedCollection = currentApi.collections.find(collection => {
      return collection.slug === referencedCollectionName
    })

    if (!referencedCollection) return null

    const displayableFields = filterVisibleFields({
      fields: referencedCollection.fields,
      view: 'list'
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

    return (
      <Label
        label={displayName}
      >
        {value && (
          <div class={styles['value-container']}>
            <div class={styles.values}>
              {values.map(value => {
                let editLink = `${referencedCollection._publishLink}/${value._id}`

                return (
                  <p class={styles.value}>
                    <a class={styles['value-link']} href={editLink}>
                      {displayField && value[displayField] || `Referenced ${displayName}`}
                    </a>
                  </p>
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
              accent="data"
              href={editLink}
              size="small"
            >Select existing {displayName.toLowerCase()}</Button>
          </div>
        )}

        {!value && isReadOnly && (
          <span>None</span>
        )}
      </Label>
    )
  }

  handleRemove() {
    const {name, onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, name, null)
    }
  }
}
