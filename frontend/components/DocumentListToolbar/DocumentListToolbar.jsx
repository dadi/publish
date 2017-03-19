'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import {buildUrl, createRoute} from 'lib/router'
import {route} from 'preact-router'

import Style from 'lib/Style'
import styles from './DocumentListToolbar.css'

import Button from 'components/Button/Button'
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
     * The object containing metadata about the current query, as defined
     * in DADI API.
     */
    metadata: proptypes.object,

    /**
     * A callback to be fired when the "Apply" button on the bulk actions
     * control is clicked.
     */
    onBulkAction: proptypes.func
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
      metadata,
      onBulkAction
    } = this.props
    const {bulkActionSelected} = this.state

    return (
      <Toolbar>
        <div class={styles.section}>
          <ToolbarTextInput
            onChange={this.handleGoToPage.bind(this)}
            size="small"
            placeholder="Go to page"
          />

          <span class={styles['count-label']}>
            Showing <strong>{`${metadata.offset + 1}-${Math.min(metadata.offset + metadata.limit, metadata.totalCount)} `}</strong>
            of <strong>{metadata.totalCount}</strong>
          </span>
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
          <select
            class={styles.actions}
            onChange={this.handleBulkActionSelect.bind(this)}
            value={bulkActionSelected}
          >
            <option disabled value={this.BULK_ACTIONS_PLACEHOLDER}>With selected...</option>
            <option value="delete">Delete</option>
          </select>

          <Button
            accent="data"
            className={styles['actions-button']}
            disabled={bulkActionSelected === this.BULK_ACTIONS_PLACEHOLDER}
            onClick={this.handleBulkActionApply.bind(this)}
            size="small"
          >Apply</Button>

        </div>
      </Toolbar>
    )
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

  handleBulkActionSelect(event) {
    this.setState({
      bulkActionSelected: event.target.value
    })
  }

  handleBulkActionApply(event) {
    const {onBulkAction} = this.props
    const {bulkActionSelected} = this.state

    if ((typeof onBulkAction === 'function') && bulkActionSelected && (bulkActionSelected !== this.BULK_ACTIONS_PLACEHOLDER)) {
      onBulkAction.call(this, bulkActionSelected)
    }
  }
}
