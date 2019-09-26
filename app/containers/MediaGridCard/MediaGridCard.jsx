import * as documentActions from 'actions/documentActions'
import {Checkbox} from '@dadi/edit-ui'
import {connectRedux} from 'lib/redux'
import {InsertDriveFile, Videocam} from '@material-ui/icons'
import {getMediaUrl} from 'lib/util/url'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './MediaGridCard.css'

const fileSize = require('file-size')

/**
 * Renders the information part of a media-specific grid card.
 */
class MediaGridCard extends React.Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

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
    isSelected: proptypes.bool,

    /**
     * Callback to be fired when the item's selection state
     * changes.
     */
    onSelect: proptypes.func,

    /**
     * The maximum number of items that can be selected.
     */
    selectLimit: proptypes.number,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  static defaultProps = {
    selectLimit: Infinity
  }

  handleCardClick(event) {
    const {href, onSelect} = this.props

    if (typeof href !== 'string' && typeof onSelect === 'function') {
      onSelect(event)
    }
  }

  handleSelectClick(event) {
    const {onSelect} = this.props

    if (typeof onSelect === 'function') {
      onSelect(event)
    }
  }

  render() {
    const {href, item, isSelected} = this.props
    const itemStyle = new Style(styles, 'wrapper').addIf(
      'wrapper-selected',
      isSelected
    )

    // For backwards compatibility.
    const mimeType = item.mimeType || item.mimetype
    const humanFileSize = fileSize(item.contentLength, {
      fixed: item.contentLength > 1e6 ? 2 : 0
    }).human('si')

    // If the `href` prop is present, we make the select element responsible
    // for changing the selected state. If not, it becomes a purely decorative
    // element with a read-only value, as the card as a whole will be used to
    // change the selected state.
    const selectProps =
      typeof href === 'string'
        ? {onChange: this.handleSelectClick.bind(this)}
        : {readOnly: true}

    return (
      <div
        className={itemStyle.getClasses()}
        onClick={this.handleCardClick.bind(this)}
      >
        <label className={styles.select}>
          <Checkbox checked={isSelected} large {...selectProps} />
        </label>

        {this.renderHead()}

        <div className={styles.metadata}>
          <div className={styles.filename}>{item.fileName}</div>
          <div className={styles.info}>
            <div className={styles.size}>{humanFileSize}</div>
            {Boolean(item.width && item.height) && (
              <div className={styles.dimensions}>
                {item.width}×{item.height}
              </div>
            )}
            <div className={styles.mimetype}>{mimeType} </div>
          </div>
        </div>
      </div>
    )
  }

  renderHead() {
    const {href, item, state} = this.props
    const mimeType = item.mimeType || item.mimetype || ''
    const {config} = state.app
    const isImage = mimeType.indexOf('image/') === 0
    const aspectRatio = isImage ? (item.height / item.width) * 100 : 100
    const url = getMediaUrl({
      config,
      document: item,
      width: 350
    })

    let headElement = this.renderHeadIcon(InsertDriveFile)

    if (isImage) {
      headElement = <img className={styles.image} src={url} />
    } else if (mimeType.indexOf('video/') === 0) {
      headElement = this.renderHeadIcon(Videocam)
    }

    if (typeof href === 'string') {
      return (
        <a
          className={styles['image-holder']}
          href={href}
          style={{paddingBottom: `${aspectRatio}%`}}
        >
          {headElement}
        </a>
      )
    }

    return (
      <div
        className={styles['image-holder']}
        style={{paddingBottom: `${aspectRatio}%`}}
      >
        {headElement}
      </div>
    )
  }

  renderHeadIcon(Icon) {
    return (
      <div className={styles['icon-container']}>
        <Icon className={styles.icon} />
      </div>
    )
  }
}

export default connectRedux(documentActions)(MediaGridCard)
