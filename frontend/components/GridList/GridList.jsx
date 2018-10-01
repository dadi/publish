'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import {debounce} from 'lib/util'

import Style from 'lib/Style'
import styles from './GridList.css'

import ConditionalLink from 'components/ConditionalLink/ConditionalLink'

const fileSize = require('file-size')

/**
 * Component for rendering API fields of type Image on a reference field select
 * list view.
 */
export default class GridList extends Component {
  static propTypes = {
    /**
     * The available documents..
     */
    data: proptypes.array,

    /**
     * The link to follow when a document is clicked. When not defined,
     * `onClick` will be evaluated (see below).
     */
    href: proptypes.string,

    /**
     * The callback to be fired when a document is clicked. When not defined,
     * clicking on a document will select it, thus invoking the `onSelect`
     * callback instead.
     */
    onClick: proptypes.func,

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

    event.stopPropagation()
  }

  render() {
    const data = this.props.data || []
    const numberOfColumns = this.getNumberOfColumns()
    const columns = Array.apply(null, {
      length: numberOfColumns
    }).map(i => [])

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

  renderItem(item, index) {
    const {
      href,
      onClick,
      selectedRows,
      selectLimit
    } = this.props
    const aspectRatio = (item.height / item.width) * 100
    const isSelected = selectedRows[index] === true
    const itemStyle = new Style(styles, 'item')
      .addIf('item-selected', isSelected)

    let onClickInnerCallback = null
    let onClickInputCallback = null
    let onClickOuterCallback = null
    

    // If `onClick` is a function, then we'll use the inner callback to
    // handle clicks on the image, the file name and the info elements,
    // leaving the checkbox for the `onSelect` callback. If it's not,
    // then we link the outer callback to `onSelect` and disable the
    // callback for the innermost elements.
    if (href || onClick) {
      onClickInnerCallback = typeof onClick === 'function' ?
        onClick.bind(this, item) :
        null
      onClickInputCallback = this.handleItemSelect.bind(this, index)
    } else {
      onClickOuterCallback = this.handleItemSelect.bind(this, index)
    }

    let resolvedHref = typeof href === 'function' ?
      href(item) :
      href

    return (
      <div
        class={itemStyle.getClasses()}
        onClick={onClickOuterCallback}
      >
        <input
          class={styles['item-select']}
          checked={isSelected}
          onChange={onClickInputCallback}
          type={selectLimit === 1 ? 'radio' : 'checkbox'}
        />

        <ConditionalLink
          condition={Boolean(href)}
          href={resolvedHref}
        >
          <div
            class={styles['item-image-holder']}
            onClick={onClickInnerCallback}
            style={`padding-bottom: ${aspectRatio}%`}
          >
            <img class={styles['item-image']} src={item.url}/>
          </div>
        </ConditionalLink>

        <ConditionalLink
          condition={Boolean(href)}
          href={resolvedHref}
        >
          <div
            class={styles['item-overlay']}
            onClick={onClickInnerCallback}
          >
            <p class={styles['item-filename']}>{item.fileName}</p>
          </div>
        </ConditionalLink>

        <ConditionalLink
          condition={Boolean(href)}
          href={resolvedHref}
        >
          <div
            class={styles['item-info']}
            onClick={onClickInnerCallback}
          >
            <div>
              <span class={styles['item-size']}>{fileSize(item.contentLength).human('si')}</span>,<br/>
              <span class={styles['item-dimensions']}>{item.width}x{item.height}</span>
            </div>
            <div>
              <span class={styles['item-mimetype']}>{item.mimetype}</span>
            </div>
          </div>
        </ConditionalLink>
      </div>
    )
  }
}
