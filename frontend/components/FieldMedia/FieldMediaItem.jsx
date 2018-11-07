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
     * A value indicating whether or not it is a list view being rendered.
     */
    isList: proptypes.bool,

    /**
     * The field value.
     */
    value: proptypes.object
  }

  getSource() {
    const {config, isList, value} = this.props
    const cdn = config ? config.cdn : null

    if (!value) return null

    // File location url
    let src = value._previewData ? value._previewData : value.url || value.path

    // Filename without extension
    const fileName = value.fileName.split('.').slice(0, -1).join('.')

    let icon = (
      <div class={styles.file}>
        <img src="/public/images/icon-file.svg" width="25" />
        <span class={styles.ext}>{value.fileName.split('.').pop()}</span>
      </div>
    )

    // For backwards compatibility.
    let mimeType = value.mimeType || value.mimetype

    // Render an image document.
    let cdnThumb = false

    if (mimeType && mimeType.indexOf('image/') === 0) {
      if (value.path && cdn && cdn.publicUrl) {
        src = `${cdn.publicUrl}/${value.path}`
        cdnThumb = src + '?width=80'
      }

      icon = (
        <div class={styles.image}>
          <img src={cdnThumb || src} />
        </div>
      )
    }

    return (
      <div class={styles.icon}>
        {icon}
        <a
          href={src}
          target="_blank"
          class={styles['file-name']}
          title={value.fileName}
        >
          {fileName}
        </a>
      </div>
    )
  }

  render() {
    return this.getSource()
  }
}