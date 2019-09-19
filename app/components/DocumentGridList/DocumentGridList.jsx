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

    return (
      <div className={styles.grid}>
        {documents.map((item, index) => (
          <div className={styles.card} key={item._id}>
            <div className={styles['content-wrapper']}>
              {onRenderCard({
                item,
                isSelected: Boolean(selectedDocuments[index]),
                onSelect: this.handleItemSelect.bind(this, index)
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }
}
