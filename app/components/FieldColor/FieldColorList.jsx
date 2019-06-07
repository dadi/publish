import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './FieldColor.css'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldColorList extends React.Component {
  static propTypes = {
    /**
     * App config.
     */
    config: proptypes.object,

    /**
     * The field schema.
     */
    schema: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.string
  }

  render() {
    const {value} = this.props

    return (
      <div className={styles.list}>
        <div
          className={styles.swatch}
          style={value ? {backgroundColor: value} : null}
        />
        {value}
      </div>
    )
  }
}
