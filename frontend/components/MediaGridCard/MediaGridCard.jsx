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
    item: proptypes.object,

    /**
     * Whether the item is selected.
     */
    isSelected: proptypes.object,

    /**
     * Callback to be fired when the item's selection state
     * changes.
     */
    onSelect: proptypes.func,

    /**
     * The maximum number of items that can be selected.
     */
    selectLimit: proptypes.number    
  }

  static defaultProps = {
    selectLimit: Infinity
  }

  render() {
    const {
      item,
      isSelected,
      onSelect,
      selectLimit
    } = this.props
    const itemStyle = new Style(styles, 'wrapper')
      .addIf('wrapper-selected', isSelected)

    // For backwards compatibility.
    let mimeType = item.mimeType || item.mimetype

    // If we're dealing with an image that has a width and a height,
    // we set the aspect ratio of the card accordingly. If not, we
    // make it a square.
    const isImage = mimeType &&
      mimeType.includes('image/') &&
      typeof item.width === 'number' &&
      typeof item.height === 'number'
    const aspectRatio = isImage ?
      (item.height / item.width) * 100 :
      100

    return (
      <div
        class={itemStyle.getClasses()}
        onClick={onSelect}
      >
        <input
          class={styles.select}
          checked={isSelected}
          type={selectLimit === 1 ? 'radio' : 'checkbox'}
        />

        <div
          class={styles['image-holder']}
          style={`padding-bottom: ${aspectRatio}%`}
        >
          {this.renderHead({isImage})}
        </div>

        <div class={styles.overlay}>
          <p class={styles.filename}>{item.fileName}</p>
        </div>

        <div class={styles.metadata}>
          <div>
            <span class={styles.size}>{fileSize(item.contentLength, { fixed: item.contentLength > 1000000 ? 2 : 0 }).human('si')}</span>
            {isImage && (
              <span class={styles.dimensions}>
                {`, ${item.width}x${item.height}`}
              </span>
            )}
          </div>
          <div>
            <span class={styles.mimetype}>{mimeType}</span>
          </div>
        </div>
      </div>
    )
  }

  renderHead({isImage}) {
    const {item} = this.props

    if (isImage) {
      return (
        <img class={styles.image} src={item.url}/>
      )
    }

    return (
      <div class={styles['generic-thumbnail']}/>
    )
  }
}
