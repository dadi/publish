'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import 'fetch'

import styles from './FieldImage.css'

export default class FieldImageList extends Component { 
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

  constructor(props) {
    super(props)
  }

  render() {
    const {value} = this.props
    const values = (value && !Array.isArray(value)) ? [value] : value
    const multiple = values && values.length > 1

    return (
      <div>
        {values &&
          <div class={styles.thumbnails}>
            <img
                class={`${styles.thumbnail} ${styles.list}`}
                src={this.getImageSrc(values[0])}
              />
            {multiple &&
              <div>and {values.length - 1} more</div>
            }
          </div>
        }
      </div>
    )
  }

  getImageSrc(value) {
    const {config} = this.props
    const cdn = config ? config.cdn : null

    if (!value) return null

    if (value._previewData) return value._previewData

    if (value.url) return value.url

    if (value.path) {
      if (
        cdn &&
        cdn.publicUrl
      ) {
        return `${cdn.publicUrl}/${value.path}`
      } else {
        return value.path
      }
    }
  }
}
