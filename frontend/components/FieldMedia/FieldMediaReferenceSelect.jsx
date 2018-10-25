'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import {debounce} from 'lib/util'

import Style from 'lib/Style'
import styles from './FieldMediaReferenceSelect.css'

const fileSize = require('file-size')

/**
 * Component for rendering API fields of type Media on a reference field select
 * list view.
 */
export default class FieldMediaReferenceSelect extends Component {
  static propTypes = {
    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The available documents..
     */
    data: proptypes.array,

    /**
     * The callback to be fired when a document is selected.
     */
    onSelect: proptypes.func,

    /**
     * The callback to be fired when the sort parameters are changed.
     */
    onSort: proptypes.func,

    /**
     * The indexes of the currently selected documents.
     */
    selectedRows: proptypes.array,

    /**
     * The maximum number of documents that can be selected.
     */
    selectLimit: proptypes.number,

    /**
     * The name of the field to sort documents by.
     */
    sortBy: proptypes.string,

    /**
     * The order used to sort the documents by the `sortBy` field.
     */
    sortOrder: proptypes.oneOf(['asc', 'desc'])
  }

  constructor(props) {
    super(props)

    this.debouncedResizeHandler = debounce(this.forceUpdate.bind(this), 500)
  }

  componentDidMount() {
    window.addEventListener('resize', this.debouncedResizeHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedResizeHandler)
  }

  render() {
    const data = this.props.data || []
    const numberOfColumns = this.getNumberOfColumns()

    let columns = Array.apply(null, {length: numberOfColumns}).map(i => [])

    data.forEach((document, index) => {
      columns[index % numberOfColumns][index] = document
    })

    return (
      <div class={styles.columns}>
        {columns.map(column => (
          <div
            class={styles.column}
            style={`width: ${100 / numberOfColumns}%`}
          >
            {column.map(this.renderItem.bind(this))}
          </div>
        ))}
      </div>
    )
  }

  getNumberOfColumns() {
    const windowWidth = window.innerWidth

    if (windowWidth > 800) {
      return 5
    } else if (windowWidth > 550) {
      return 3
    } else {
      return 1
    }
  }

  handleItemSelect(index, event) {
    const {
      onSelect,
      selectLimit,
      selectedRows
    } = this.props
    const selected = !Boolean(selectedRows[index])
    const selectedRowsIndices = Object.keys(selectedRows)

    let newSelectedRows = {}

    // If only one row can be selected at a time, the logic is quite simple:
    // the new object of selected rows contains only the index that has been
    // received.
    if (selectLimit === 1) {
      newSelectedRows = {
        [index]: true
      }
    } else {
      // Otherwise, we need to merge the previous state of selected rows with
      // the new selection.
      newSelectedRows = Object.assign({}, selectedRows, {
        [index]: selected
      })
    }

    if (typeof onSelect === 'function') {
      onSelect.call(this, newSelectedRows)
    }
  }

  getImageSrc(value) {
    const {config} = this.props
    const cdn = config ? config.cdn : null

    if (!value) return null

    if (value._previewData) return value._previewData

    if (value.url) return value.url

    if (value.path) {
      if (
        cdn &&
        cdn.publicUrl
      ) {
        return `${cdn.publicUrl}/${value.path}`
      } else {
        return value.path
      }
    }
  }

  renderItem(item, index) {
    const {
      selectedRows,
      selectLimit
    } = this.props
    const aspectRatio = (item.height / item.width) * 100
    const isSelected = selectedRows[index] === true
    const itemStyle = new Style(styles, 'item')
      .addIf('item-selected', isSelected)

    return (
      <div
        class={itemStyle.getClasses()}
        onClick={this.handleItemSelect.bind(this, index)}
      >
        <input
          class={styles['item-select']}
          checked={isSelected}
          type={selectLimit === 1 ? 'radio' : 'checkbox'}
        />

        <div
          class={styles['item-image-holder']}
          style={`padding-bottom: ${aspectRatio}%`}
        >
          <img class={styles['item-image']} src={this.getImageSrc(item)}/>
        </div>

        <div class={styles['item-overlay']}>
          <p class={styles['item-filename']}>{item.fileName}</p>
        </div>

        <div class={styles['item-info']}>
          <div>
            <span class={styles['item-size']}>{fileSize(item.contentLength).human('si')}</span>,<br/>
            <span class={styles['item-dimensions']}>{item.width}x{item.height}</span>
          </div>
          <div>
            <span class={styles['item-mimetype']}>{item.mimetype}</span>
          </div>
        </div>
      </div>
    )
  }
}
