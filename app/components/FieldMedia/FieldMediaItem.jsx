import {getMediaUrl} from 'lib/util/url'
import proptypes from 'prop-types'
import React from 'react'
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

    if (!value) {
      return null
    }

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
    const mimeType = value.mimeType || value.mimetype

    if (mimeType && mimeType.indexOf('image/') === 0) {
      const imageUrl = getMediaUrl({
        config,
        document: value,
        width: 80
      })

      icon = (
        <div className={styles.image}>
          <img src={imageUrl} />
        </div>
      )
    }

    const assetUrl = getMediaUrl({
      config,
      document: value
    })

    return (
      <div className={styles.icon}>
        {icon}

        {!isList && (
          <a
            href={assetUrl}
            target="_blank"
            className={styles['file-name']}
            title={value.fileName}
          >
            {fileName}
          </a>
        )}
      </div>
    )
  }
}
