'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {getVisibleFields} from 'lib/fields'

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
    const {
      collection,
      currentApi,
      schema,
      value
    } = this.props

    const referencedCollectionName = schema.settings && schema.settings.collection
    if (!referencedCollectionName) return null

    const referencedCollection = currentApi.collections.find(collection => {
      return collection.slug === referencedCollectionName
    })

    if (!referencedCollection) return null

    const optionsBlock = schema.publish && schema.publish.options
    const displayableFields = getVisibleFields({
      fields: referencedCollection.fields,
      viewType: 'list'
    })
    const firstStringField = this.findFirstStringField(displayableFields)
    const values = value && !(value instanceof Array) ? [value] : value

    if (values) {
      return (
        <div class={styles.values}>
          {values.map((val, idx) => {
            let collection = schema.settings.collection
            let editLink = `${referencedCollection._publishLink}/${val._id}`
            let displayField = optionsBlock && optionsBlock.displayField || firstStringField ? firstStringField.key : null

            return (
              <a class={styles['value-link']} href={editLink}>
                {displayField && val[displayField] || `Referenced ${collection}`}
              </a>
            )
          })}
        </div>
      )
    } else {
      return (
        <div class={styles.values}><div class={styles.empty}>None</div></div>
      )
    }
  }
}
