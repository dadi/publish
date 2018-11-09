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
     * The link to be followed when the card is clicked.
     */
    href: proptypes.string,

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

  handleCardClick(event) {
    const {
      href,
      onSelect
    } = this.props

    if (typeof href !== 'string' && typeof onSelect === 'function') {
      onSelect(event)

      event.stopPropagation()
    }
  }

  handleSelectClick(event) {
    const {
      onSelect
    } = this.props

    if (typeof onSelect === 'function') {
      onSelect(event)
    }

    event.stopPropagation()
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

    // Human-friendly file size.
    let humanFileSize = fileSize(item.contentLength, {
      fixed: item.contentLength > 1000000 ? 2 : 0
    }).human('si')

    return (
      <div
        class={itemStyle.getClasses()}
        onClick={this.handleCardClick.bind(this)}
      >
        <input
          class={styles.select}
          checked={isSelected}
          onClick={this.handleSelectClick.bind(this)}
          type={selectLimit === 1 ? 'radio' : 'checkbox'}
        />

        {this.renderHead({isImage})}

        <div class={styles.metadata}>
          <p class={styles.filename}>{item.fileName}</p>
          <div>
            <span class={styles.size}>{humanFileSize}</span>

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
    const {
      href,
      item,
      onSelect
    } = this.props
    const aspectRatio = isImage ?
      (item.height / item.width) * 100 :
      100

    let headElement = isImage ?
      <img class={styles.image} src={item.url}/> :
      <div class={styles['generic-thumbnail']}/>

    if (typeof href === 'string') {
      return (
        <a
          class={styles['image-holder']}
          href={href}
          style={`padding-bottom: ${aspectRatio}%`}
        >{headElement}</a>
      )
    }

    return (
      <div
        class={styles['image-holder']}
        onClick={this.handleCardClick.bind(this)}
        style={`padding-bottom: ${aspectRatio}%`}
      >{headElement}</div>
    )
  }
}
