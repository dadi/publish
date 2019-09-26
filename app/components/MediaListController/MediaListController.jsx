import {Button, Checkbox} from '@dadi/edit-ui'
import {ViewHeadline, ViewModule} from '@material-ui/icons'
import FileUpload from 'components/FileUpload/FileUpload'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './MediaListController.css'

// See http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

/**
 * A controller bar for a list of media documents.
 */
export default class MediaListController extends React.Component {
  static propTypes = {
    /**
     * The list of documents shown in the list.
     */
    documents: proptypes.array,

    /**
     * The current list mode.
     */
    mode: proptypes.oneOf(['grid', 'table']),

    /**
     * Callback to be fired when the list mode is updated.
     */
    onListModeUpdate: proptypes.func,

    /**
     * Callback to be fired when the selection changes.
     */
    onSelect: proptypes.func,

    /**
     * Callback to be fired when the user clicks the upload button.
     */
    onUpload: proptypes.func,

    /**
     * The list of currently selected documents.
     */
    selectedDocuments: proptypes.object
  }

  constructor(props) {
    super(props)

    this.handleSelectAll = this.handleSelectAll.bind(this)

    this.enableGridView = () => props.onListModeUpdate('grid')
    this.enableTableView = () => props.onListModeUpdate('table')

    this.state = {
      hasAllDocumentsSelected: false
    }
  }

  static getDerivedStateFromProps(props) {
    const {documents, selectedDocuments} = props

    return {
      hasAllDocumentsSelected: Object.keys(documents).every(
        index => selectedDocuments[index]
      )
    }
  }

  handleSelectAll() {
    const {documents, onSelect} = this.props
    const {hasAllDocumentsSelected} = this.state
    const newSelection = documents.reduce((result, document, index) => {
      result[index] = hasAllDocumentsSelected ? false : document

      return result
    }, {})

    if (typeof onSelect === 'function') {
      onSelect(newSelection)
    }
  }

  render() {
    const {mode, onUpload} = this.props
    const {hasAllDocumentsSelected} = this.state
    const gridIcon = new Style(styles, 'list-mode-icon').addIf(
      'active',
      mode === 'grid'
    )
    const tableIcon = new Style(styles, 'list-mode-icon').addIf(
      'active',
      mode === 'table'
    )

    return (
      <div className={styles.container}>
        <div>
          <label
            aria-hidden={mode === 'table' ? 'true' : null}
            className={styles['select-all-label']}
          >
            <Checkbox
              checked={hasAllDocumentsSelected}
              onChange={this.handleSelectAll}
            />
            <span>Select all</span>
          </label>
        </div>
        <div className={styles['upload-area']}>
          <FileUpload multiple={true} onChange={onUpload}>
            <Button accent="positive" filled mock>
              Select files
            </Button>
          </FileUpload>
          {!isTouchDevice && <span> or drag and drop to upload</span>}
        </div>
        <div>
          <button
            className={styles['list-mode-button']}
            disabled={mode === 'grid'}
          >
            <ViewModule
              className={gridIcon.getClasses()}
              onClick={this.enableGridView}
            />
          </button>

          <button
            className={styles['list-mode-button']}
            disabled={mode === 'table'}
          >
            <ViewHeadline
              className={tableIcon.getClasses()}
              onClick={this.enableTableView}
            />
          </button>
        </div>
      </div>
    )
  }
}
