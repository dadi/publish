'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import {buildUrl, createRoute} from 'lib/router'
import {route} from 'preact-router'

import Style from 'lib/Style'
import styles from './DocumentListToolbar.css'

import Button from 'components/Button/Button'
import ButtonWithPrompt from 'components/ButtonWithPrompt/ButtonWithPrompt'
import Checkbox from 'components/Checkbox/Checkbox'
import Paginator from 'components/Paginator/Paginator'
import Toolbar from 'components/Toolbar/Toolbar'
import ToolbarTextInput from 'components/Toolbar/ToolbarTextInput'

/**
 * A toolbar used in a document list view.
 */
export default class DocumentListToolbar extends Component {
  static propTypes = {
    /**
     * The name of the collection being used.
     */
    collection: proptypes.string,

    /**
     * The name of the group where the current collection belongs (if any).
     */
    group: proptypes.string,

    /**
     * Whether the current list of documents refers to a nested document.
     */
    isReferencedField: proptypes.bool,

    /**
     * The object containing metadata about the current query, as defined
     * in DADI API.
     */
    metadata: proptypes.object,

    /**
     * A callback to be fired when the "Apply" button on the bulk actions
     * control is clicked.
     */
    onBulkAction: proptypes.func,

    /**
     * A callback to be fired when a reference document has been selected.
     */
    onReferenceDocumentSelect: proptypes.func,

    /**
     * A list of the IDs of the currently selected documents.
     */
    selectedDocuments: proptypes.array
  }

  static defaultProps = {
    isReferencedField: false
  }

  constructor(props) {
    super(props)

    this.BULK_ACTIONS_PLACEHOLDER = 'BULK_ACTIONS_PLACEHOLDER'
    this.state.bulkActionSelected = this.BULK_ACTIONS_PLACEHOLDER
  }

  render() {
    const {
      collection,
      group,
      isReferencedField,
      metadata,
      onBulkAction,
      selectedDocuments
    } = this.props
    const {bulkActionSelected} = this.state

    return (
      <Toolbar>
        <div class={styles.section}>
          <div class={styles.information}>
            {metadata.totalCount > metadata.limit && (
              <ToolbarTextInput
                className={styles['page-input']}
                onChange={this.handleGoToPage.bind(this)}
                size="small"
                placeholder="Go to page"
              />
            )}
            {metadata.totalCount > 1 && (
              <span class={styles['count-label']}>
                <span>Showing </span>
                <strong>{`${metadata.offset + 1}-${Math.min(metadata.offset + metadata.limit, metadata.totalCount)} `}</strong>
                of <strong>{metadata.totalCount}</strong>
              </span>
            )}   
          </div>
        </div>

        <div class={styles.section}>
          <Paginator
            currentPage={metadata.page}
            linkCallback={page => buildUrl(group, collection, 'documents', page)}
            maxPages={8}
            totalPages={metadata.totalPages}
          />
        </div>

        <div class={styles.section}>
          {isReferencedField
            ? this.renderReferencedDocumentActions()
            : this.renderBulkActions()
          }
        </div>
      </Toolbar>
    )
  }

  renderBulkActions() {
    const {bulkActionSelected} = this.state
    const {selectedDocuments} = this.props

    return (
      <div class={styles.actions}>
        <select
          class={styles.select}
          onChange={this.handleBulkActionSelect.bind(this)}
          value={bulkActionSelected}
        >
          <option disabled value={this.BULK_ACTIONS_PLACEHOLDER}>With selected...</option>
          <option value="delete">Delete</option>
        </select>

        <ButtonWithPrompt
          accent="data"
          className={styles['select-button']}
          disabled={(bulkActionSelected === this.BULK_ACTIONS_PLACEHOLDER) || !selectedDocuments.length}
          onClick={this.handleBulkActionApply.bind(this)}
          promptCallToAction="Yes, delete them."
          promptMessage="Are you sure you want to delete the selected documents?"
          size="small"
        >Apply</ButtonWithPrompt>
      </div>
    )
  }

  renderReferencedDocumentActions() {
    const {selectedDocuments} = this.props

    return (
      <div class={styles.actions}>
        <Button
          accent="save"
          disabled={!selectedDocuments.length}
          onClick={this.handleReferencedDocumentSelect.bind(this)}
        >Add selected document</Button>
      </div>
    )
  }

  handleBulkActionApply(event) {
    const {onBulkAction} = this.props
    const {bulkActionSelected} = this.state
    const validBulkActionSelected = bulkActionSelected &&
      (bulkActionSelected !== this.BULK_ACTIONS_PLACEHOLDER)

    if (validBulkActionSelected && (typeof onBulkAction === 'function')) {
      onBulkAction.call(this, bulkActionSelected)
    }
  }

  handleBulkActionSelect(event) {
    this.setState({
      bulkActionSelected: event.target.value
    })
  }

  handleGoToPage(event) {
    const {collection, group, metadata} = this.props
    const inputValue = event.target.value
    const parsedValue = parseInt(inputValue)

    // If the input is not a valid positive integer number, we return.
    if ((parsedValue.toString() !== inputValue) || (parsedValue <= 0)) return

    // If the number inserted is outside the range of the pages available,
    // we return.
    if (parsedValue > metadata.totalPages) return

    route(buildUrl(group, collection, 'documents', parsedValue))
  }

  handleReferencedDocumentSelect() {
    const {
      onReferenceDocumentSelect,
      selectedDocuments
    } = this.props

    if (typeof onReferenceDocumentSelect === 'function') {
      onReferenceDocumentSelect()
    }
  }
}
