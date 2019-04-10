'use strict'

import {h, Component} from 'preact'
import {debounce} from 'lib/util'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './DocumentGridList.css'

const fileSize = require('file-size')

/**
 * A grid view for listing documents.
 */
export default class DocumentGridList extends Component {
  static propTypes = {
    /**
     * The API to operate on.
     */
    api: proptypes.object,

    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The parent collection to operate on, when dealing with a reference field.
     */
    collectionParent: proptypes.object,

    /**
     * The application configuration object.
     */
    config: proptypes.object,

    /**
     * When on a reference field, contains the ID of the parent document.
     */
    documentId: proptypes.string,

    /**
     * The list of documents to display.
     */
    documents: proptypes.array,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * A function for rendering cards for items.
     */
    onRenderCard: proptypes.func,

    /**
     * A callback to be fired with a new document selection.
     */
    onSelect: proptypes.func,

    /**
     * The order used to sort the documents by the `sort` field.
     */
    order: proptypes.oneOf(['asc', 'desc']),

    /**
     * The name of a reference field currently being edited (if any).
     */
    referencedField: proptypes.string,

    /**
     * A hash map of the indices of the currently selected documents.
     */
    selectedDocuments: proptypes.object,

    /**
     * The maximum number of documents that can be selected.
     */
    selectLimit: proptypes.number,

    /**
     * The name of the field currently being used to sort the documents.
     */
    sort: proptypes.string
  }

  static defaultProps = {
    selectedDocuments: {},
    selectLimit: Infinity,
  }

  constructor(props) {
    super(props)

    this.debouncedResizeHandler = debounce(() => {
      this.forceUpdate()
    }, 500)
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

  handleItemSelect(index) {
    const {
      onSelect,
      selectLimit,
      selectedDocuments
    } = this.props
    const isSelected = !Boolean(selectedDocuments[index])

    let newSelectedDocuments = {}

    // If only one row can be selected at a time, the logic is quite simple:
    // the new object of selected rows contains only the index that has been
    // received.
    if (selectLimit === 1) {
      newSelectedDocuments = {
        [index]: isSelected
      }
    } else {
      // Otherwise, we need to merge the previous state of selected rows with
      // the new selection.
      newSelectedDocuments = Object.assign({}, selectedDocuments, {
        [index]: isSelected
      })
    }

    if (typeof onSelect === 'function') {
      onSelect.call(this, newSelectedDocuments)
    }
  }

  render() {
    const {
      documents,
      onRenderCard,
      selectedDocuments
    } = this.props

    if (typeof onRenderCard !== 'function') {
      return null
    }

    const numberOfColumns = this.getNumberOfColumns()

    let columns = Array.apply(null, {length: numberOfColumns}).map(i => [])

    documents.forEach((document, index) => {
      columns[index % numberOfColumns][index] = document
    })

    return (
      <div class={styles.columns}>
        {columns.map(column => (
          <div
            class={styles.column}
            style={`width: ${100 / numberOfColumns}%`}
          >
            {column.map((item, index) => {
              const onSelect = this.handleItemSelect.bind(this, index)

              return onRenderCard(item, onSelect, Boolean(selectedDocuments[index]))
            })}
          </div>
        ))}
      </div>
    )
  }
}
