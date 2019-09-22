import * as documentActions from 'actions/documentActions'
import {Checkbox} from '@dadi/edit-ui'
import {connectRedux} from 'lib/redux'
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

  constructor(props) {
    super(props)

    this.handleCardClick = this.handleCardClick.bind(this)
    this.handleSelectClick = this.handleSelectClick.bind(this)
  }

  handleCardClick(event) {
    // Deselecting the last item by clicking on the card causes navigation
    // to that item. This prevents that. Alternative solutions more than welcome.
    event.preventDefault()
    this.handleSelectClick(event)
  }

  handleSelectClick(event) {
    const {onSelect} = this.props

    if (typeof onSelect === 'function') {
      onSelect(event)
    }
  }

  render() {
    const {href, item, isSelected, isSelectMode} = this.props
    const cardStyle = new Style(styles, 'card').addIf(
      'select-mode',
      isSelectMode
    )

    // For backwards compatibility.
    const mimeType = item.mimeType || item.mimetype
    const isImage = mimeType && mimeType.includes('image/')
    const humanFileSize = fileSize(item.contentLength, {
      fixed: item.contentLength > 1e6 ? 2 : 0
    }).human('si')

    // If the `href` prop is present, we make the select element responsible
    // for changing the selected state. If not, it becomes a purely decorative
    // element with a read-only value, as the card as a whole will be used to
    // change the selected state.
    const selectProps =
      typeof href === 'string'
        ? {onChange: this.handleSelectClick}
        : {readOnly: true}

    const wrapperProps =
      href && !isSelectMode ? {href} : {onClick: this.handleCardClick}

    return (
      <div className={cardStyle.getClasses()}>
        <label className={styles.select}>
          <Checkbox checked={isSelected} {...selectProps} />
        </label>
        <a className={styles['body-wrapper']} {...wrapperProps}>
          {this.renderHead({isImage})}
        </a>
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

  renderHead({isImage}) {
    const {item, state} = this.props
    const {config} = state.app
    const canonicalPath =
      item.path && (item.path.indexOf('/') === 0 ? item.path : `/${item.path}`)
    const url =
      config.cdn && config.cdn.publicUrl
        ? `${config.cdn.publicUrl}${canonicalPath}?width=600`
        : item.url || canonicalPath

    return isImage ? (
      <img className={styles.image} src={url} />
    ) : (
      <div className={styles['generic-thumbnail']} />
    )
  }
}

export default connectRedux(documentActions)(MediaGridCard)
