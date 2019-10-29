import FieldMediaItem from './FieldMediaItem'
import proptypes from 'prop-types'
import React from 'react'
import styles from './FieldMedia.css'

export default class FieldMediaList extends React.Component {
  static propTypes = {
    /**
     * The schema of the API being used.
     */
    api: proptypes.object,

    /**
     * The name of the collection being edited, as per the URL.
     */
    collection: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.oneOfType([proptypes.array, proptypes.string]),

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {config, value} = this.props
    const values = value && !Array.isArray(value) ? [value] : value
    const hasMultiple = values && values.length > 1

    if (!values) return null

    return (
      <div className={styles['list-item']}>
        <FieldMediaItem config={config} isList={true} value={values[0]} />

        {hasMultiple && (
          <span className={styles.more}>and {values.length - 1} more</span>
        )}
      </div>
    )
  }
}
