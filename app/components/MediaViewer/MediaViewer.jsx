import proptypes from 'prop-types'
import React from 'react'
import styles from './MediaViewer.css'

/**
 * A component for rendering media objects.
 */
export default class MediaViewer extends React.Component {
  static propTypes = {
    /**
     * The CDN configuration object.
     */
    cdn: proptypes.object,

    /**
     * The media document.
     */
    document: proptypes.object
  }

  render() {
    const {cdn, document} = this.props
    const {mimeType = ''} = document
    const canonicalPath =
      document.path &&
      (document.path.indexOf('/') === 0 ? document.path : `/${document.path}`)
    const url =
      cdn && cdn.publicUrl
        ? `${cdn.publicUrl}${canonicalPath}`
        : document.url || canonicalPath

    if (mimeType.indexOf('image/') === 0) {
      return <img className={styles.image} src={url} />
    }

    if (mimeType.indexOf('video/') === 0) {
      return (
        <video className={styles.video} controls>
          <source type={mimeType} src={url} />
        </video>
      )
    }

    if (mimeType === 'application/pdf') {
      return (
        <object className={styles.pdf} data={url} type="application/pdf">
          <iframe src={url} />
        </object>
      )
    }

    return (
      <p className={styles.information}>
        No preview available for this file type
      </p>
    )
  }
}
