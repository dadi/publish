'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import Style from 'lib/Style'
import styles from './FieldMedia.css'

export default class FieldMediaItem extends Component { 
  static propTypes = {
    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.bool
  }

  constructor(props) {
    super(props)
  }

  getSource () {
    const {config, isList, value} = this.props
    const cdn = config ? config.cdn : null

    if (!value) return null

    const styleExt = new Style(styles, 'ext')
      .addIf('list', isList)

    // Get the image path if applicable
    if (value.mimetype && value.mimetype.indexOf('image') > -1) {
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
        <div class={styles.image}>
          <img src={src} />
        </div>
      )
    } else {
      return (
        <div class={styles.file}>
          {!isList && (<img src="/public/images/icon-file.svg" width="25" />)}
          <span class={styleExt.getClasses()}>{value.fileName.split('.').pop()}</span>
        </div>
      )
    }
  }

  render() {
    return this.getSource()
  }
}