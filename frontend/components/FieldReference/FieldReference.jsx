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
 * Component for API fields of type String
 */
export default class FieldString extends Component {
  static propTypes = {
    /**
     * Whether the field contains a validation error.
     */
    error: proptypes.bool,

    /**
     * If true, validation will be executed immediately and not only when the
     * content of the field has changed.
     */
    forceValidation: proptypes.bool,

    /**
     * Callback to be executed when there is a change in the value of the field.
     */
    onChange: proptypes.func,

    /**
     * Callback to be executed when there is a new validation error in the field.
     */
    onError: proptypes.func,

    /**
     * The field value.
     */
    value: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object
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
      onChange,
      onError,
      value,
      schema
    } = this.props
    const referencedCollectionName = schema.settings && schema.settings.collection

    if (!referencedCollectionName) return null

    const referencedCollection = currentApi.collections.find(collection => {
      return collection.name === referencedCollectionName
    })

    if (!referencedCollection) return null

    const displayName = schema.label || schema._id
    const displayField = value &&
      Object.keys(filterHiddenFields(referencedCollection.fields, 'list'))[0]

    return (
      <Label
        label={displayName}
      >
        {value
          ? (
            <div class={styles['value-container']}>
              <p class={styles.value}>{displayField && value[displayField]}</p>

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
                href={buildUrl(
                  group,
                  collection,
                  'document',
                  'edit',
                  documentId,
                  'select',
                  schema._id
                )}
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
