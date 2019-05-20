import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './FieldReference.css'

/**
 * Component for adding annotations to fields of type Reference on a list header.
 */
export default class FieldReferenceListHeadAnnotation extends React.Component {
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

  render() {
    return (
      <span className={styles['list-head-annotation']}>Ref</span>
    )
  }
}
