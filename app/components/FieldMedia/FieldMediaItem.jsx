import React from 'react'
import proptypes from 'prop-types'
import styles from './FieldMedia.css'

export default class FieldMediaItem extends React.Component {
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
    value: proptypes.oneOfType([proptypes.object, proptypes.string])
  }

  render() {
    const {config, isList, value} = this.props
    const cdn = config ? config.cdn : null

    if (!value) {
      return null
    }

    // File location url
    let src = value._previewData ? value._previewData : value.url || value.path

    const fileName =
      value.fileName &&
      value.fileName
        .split('.')
        .slice(0, -1)
        .join('.')
    const extension = value.fileName && value.fileName.slice(-1)[0]

    let icon = (
      <div className={styles.file}>
        <img src="/_public/images/icon-file.svg" width="25" />
        {extension && <span className={styles.ext}>{extension}</span>}
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
        <div className={styles.image}>
          <img src={cdnThumb || src} />
        </div>
      )
    }

    return (
      <div className={styles.icon}>
        {icon}
        <a
          href={src}
          target="_blank"
          className={styles['file-name']}
          title={value.fileName}
        >
          {fileName}
        </a>
      </div>
    )
  }
}
