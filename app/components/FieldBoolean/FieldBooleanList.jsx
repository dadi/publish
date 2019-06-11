import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './FieldBoolean.css'

/**
 * Component for rendering API fields of type Boolean on a list view.
 */
export default class FieldBooleanList extends React.Component {
  static propTypes = {
    /**
     * The field value.
     */
    value: proptypes.bool,

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  render() {
    const {value} = this.props

    return value ? (
      <span className={styles.enabled}>Yes</span>
    ) : (
      <span className={styles.disabled}>No</span>
    )
  }
}
