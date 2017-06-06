'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {buildUrl} from 'lib/router'
import {filterHiddenFields} from 'lib/util'

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
     * If defined, specifies a group where the current collection belongs.
     */
    group: proptypes.string,

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
      documentId,
      error,
      group,
      forceValidation,
      onBuildBaseUrl,
      onChange,
      onError,
      value,
      schema
    } = this.props
    const referencedCollectionName = schema.settings && schema.settings.collection
    if (!referencedCollectionName) return null

    const referencedCollection = currentApi.collections.find(collection => {
      return collection.slug === referencedCollectionName
    })

    if (!referencedCollection) return null
    const displayName = schema.label || schema._id
    const displayableFields = filterHiddenFields(referencedCollection.fields, 'list')
    const firstStringField = this.findFirstStringField(displayableFields)
    const displayField = value && firstStringField ? firstStringField.key : null
    const href = buildUrl(...onBuildBaseUrl(), 'select', schema._id)
    const values = value && !(value instanceof Array) ? [value] : value

    return (
      <Label
        label={displayName}
      >
        {value
          ? (
            <div class={styles['value-container']}>
              <div>
                {values.map(value => (
                  <p class={styles.value}>{displayField && value[displayField] || `Referenced ${displayName}`}</p>
                ))}
              </div>

              <Button
                accent="destruct"
                onClick={this.handleRemove.bind(this)}
                size="small"
              >Remove</Button>
            </div>
          )

          : (
            <div class={styles.placeholder}>
              <Button
                accent="data"
                href={href}
                size="small"
              >Select existing {displayName.toLowerCase()}</Button>
            </div>
          )
        }
      </Label>
    )
  }

  handleRemove() {
    const {onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, null)
    }
  }
}
