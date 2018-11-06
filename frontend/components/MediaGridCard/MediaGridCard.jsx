'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './MediaGridCard.css'

const fileSize = require('file-size')

/**
 * Renders the information part of a media-specific grid card.
 */
export default class MediaCard extends Component {
  static propTypes = {
    /**
     * The media object to be rendered.
     */
    item: proptypes.object
  }

  render() {
    const {
      contentLength,
      height,
      mimetype: mimeType,
      width
    } = this.props.item

    return (
      <div class={styles.wrapper}>
        <div>
          <span class={styles.size}>{fileSize(contentLength).human('si')}</span>,<br/>
          <span class={styles.dimensions}>{width}x{height}</span>
        </div>
        <div>
          <span class={styles.mimetype}>{mimeType}</span>
        </div>
      </div>
    )
  }
}
