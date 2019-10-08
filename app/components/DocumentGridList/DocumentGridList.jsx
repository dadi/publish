import {debounce} from 'lib/util'
import proptypes from 'prop-types'
import React from 'react'
import styles from './DocumentGridList.css'

/**
 * A grid view for listing documents.
 */
export default class DocumentGridList extends React.Component {
  static propTypes = {
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
     * A hash map of the indices of the currently selected documents.
     */
    selectedDocuments: proptypes.object,

    /**
     * The maximum number of documents that can be selected.
     */
    selectLimit: proptypes.number
  }

  static defaultProps = {
    selectedDocuments: {},
    selectLimit: Infinity
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

    if (windowWidth > 3000) {
      return 10
    } else if (windowWidth > 2700) {
      return 9
    } else if (windowWidth > 2400) {
      return 8
    } else if (windowWidth > 2100) {
      return 7
    } else if (windowWidth > 1800) {
      return 6
    } else if (windowWidth > 1500) {
      return 5
    } else if (windowWidth > 1200) {
      return 4
    } else if (windowWidth > 900) {
      return 3
    } else if (windowWidth > 600) {
      return 2
    }

    return 1
  }

  handleItemSelect(index) {
    const {onSelect, selectedDocuments, selectLimit} = this.props
    const isSelected = !selectedDocuments[index]

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
    const {documents, onRenderCard, selectedDocuments} = this.props

    if (typeof onRenderCard !== 'function') {
      return null
    }

    const numberOfColumns = this.getNumberOfColumns()

    const columns = Array.apply(null, {length: numberOfColumns}).map(i => [])

    documents.forEach((document, index) => {
      columns[index % numberOfColumns][index] = document
    })

    return (
      <div className={styles.columns}>
        {columns.map((column, index) => (
          <div
            className={styles.column}
            key={index}
            style={{width: `${100 / numberOfColumns}%`}}
          >
            {column.map((item, index) =>
              onRenderCard({
                item,
                isSelected: Boolean(selectedDocuments[index]),
                onSelect: this.handleItemSelect.bind(this, index)
              })
            )}
          </div>
        ))}
      </div>
    )
  }
}
