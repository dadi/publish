import {getVisibleFields} from 'lib/fields'
import {Link} from 'react-router-dom'
import proptypes from 'prop-types'
import React from 'react'
import styles from './FieldReference.css'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldReferenceList extends React.Component {
  static propTypes = {
    /**
     * The schema of the API being used.
     */
    api: proptypes.object,

    /**
     * The schema of the collection being edited.
     */
    collection: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.oneOfType([
      proptypes.array,
      proptypes.string
    ]),

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
      api,
      schema,
      value
    } = this.props

    const {settings = {}} = schema

    // For now, we don't deal with Reference fields that don't specify the
    // collection they're linked to.
    if (!settings.collection) return null

    const referencedCollection = api.collections.find(collection => {
      return collection.slug === settings.collection
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
        <div className={styles.values}>
          {values.map(val => {
            let collection = schema.settings.collection
            let editLink = `${referencedCollection._publishLink}/${val._id}`
            let displayField = optionsBlock && optionsBlock.displayField || firstStringField ? firstStringField.key : null

            return (
              <Link
                className={styles['value-link']}
                key={editLink}
                to={editLink}
              >
                {displayField && val[displayField] || `Referenced ${collection}`}
              </Link>
            )
          })}
        </div>
      )
    } else {
      return (
        <div className={styles.values}><div className={styles.empty}>None</div></div>
      )
    }
  }
}
