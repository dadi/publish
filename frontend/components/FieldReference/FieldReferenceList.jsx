'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {filterVisibleFields} from 'lib/fields'

import Style from 'lib/Style'
import styles from './FieldReference.css'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldReferenceList extends Component {
  static propTypes = {
    /**
     * The name of the collection being edited, as per the URL.
     */
    collection: proptypes.string,

    /**
     * The schema of the API being used.
     */
    currentApi: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  findFirstStringField(fields) {
    return Object.keys(fields)
      .map(key => Object.assign({}, fields[key], {key}))
      .find(field => field.type === 'String')
  }

  render() {
    const {schema, value, currentApi, collection} = this.props

    const referencedCollectionName = schema.settings && schema.settings.collection
    if (!referencedCollectionName) return null

    const referencedCollection = currentApi.collections.find(collection => {
      return collection.slug === referencedCollectionName
    })

    if (!referencedCollection) return null

    if (!value) return null

    const optionsBlock = schema.publish && schema.publish.options
    const displayableFields = filterVisibleFields({
      fields: referencedCollection.fields,
      view: 'list'
    })

    const firstStringField = this.findFirstStringField(displayableFields)

    if (optionsBlock) {
      return (<div class={styles.values}>
        {value.map(val => {
          let collection = schema.settings.collection
          let editLink = `${collection}/${val._id}`
          let displayField = optionsBlock.field || firstStringField ? firstStringField.key : null

          return <div><a class={styles['value-link']} href={editLink}>
            {displayField && val[displayField] || `Referenced ${collection}`}
          </a>, </div>
        })}
      </div>
      )
    }
  }
}
