'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldReference.css'

/**
 * Component for adding annotations to fields of type Reference on a list header.
 */
export default class FieldReferenceListHeadAnnotation extends Component {
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
      <span class={styles['list-head-annotation']}>Ref</span>
    )
  }
}
