'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import 'fetch'

import styles from './FieldMedia.css'

export default class FieldMediaList extends Component { 
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

  getSource (value) {
    const {config} = this.props
    const cdn = config ? config.cdn : null

    if (!value) return null

    let metaData = [
      value.fileName,
      `${value.contentLength ? '(' + Math.floor(value.contentLength / 1000) + 'kB)' : ''}`
    ]

    if (value.mimetype) {
      if (value.mimetype.indexOf('image') > -1) {
        let src = ''
        if (value._previewData) {
          src = value._previewData
        } else if (value.url) {
          src = value.url
        } else if (value.path) {
          if (cdn && cdn.publicUrl) {
            src = `${cdn.publicUrl}/${value.path}`
          } else {
            src = value.path
          }
        }

        return (
          <img class={`${styles.thumbnail} ${styles.list}`} src={src} title={metaData.join(' ')} />
        )
      } else {
        return (
          <span class={styles.thumbnail}>{metaData.join(' ')}</span>
        )
      }
    }
  }

  render() {
    const {value} = this.props
    const values = (value && !Array.isArray(value)) ? [value] : value
    const multiple = values && values.length > 1

    return (
      <div>
        {values &&
          <div class={styles.thumbnails}>
            {
              this.getSource(values[0])
            }
            {multiple &&
              (<div>and {values.length - 1} more</div>)
            }
          </div>
        }
      </div>
    )
  }
}
