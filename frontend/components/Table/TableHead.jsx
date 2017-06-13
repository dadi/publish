'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Table.css'

import TableHeadCell from 'components/Table/TableHeadCell'

/**
 * A table head.
 */
export default class TableHead extends Component {
  static propTypes = {
    /**
     * Whether to render a checkbox that toggles the select state for all rows.
     */
    allowBulkSelection: proptypes.bool,

    /**
     * Whether all the rows in the table are currently selected.
     */
    allSelected: proptypes.bool,

    /**
     * Whether there are any selected rows.
     */
    hasSelected: proptypes.bool,

    /**
     * Whether rows are selectable. When `true`, check boxes will automatically
     * be added to the table head and to each row.
     */
    selectable: proptypes.bool,

    /**
     * The contents of the table head.
     */
    children: proptypes.node
  }

  static defaultProps = {
    allowBulkSelection: true,
    allSelected: false,
    hasSelected: false,
    selectable: false
  }

  handleSelectClick(event) {
    const {onSelect} = this.props

    if (typeof onSelect === 'function') {
      onSelect(event)
    }
  }

  render() {
    const {
      allowBulkSelection,
      allSelected,
      hasSelected,
      selectable
    } = this.props

    return (
      <thead class={styles.head}>
        <tr>
          {selectable &&
            <TableHeadCell select={true}>
              <input
                checked={allSelected}
                class={styles.select}
                type="checkbox"
                onClick={this.handleSelectClick.bind(this)}
                indeterminate={!allSelected && hasSelected}
                style={!allowBulkSelection && 'display: none;'}
              />
            </TableHeadCell>
          }
          {this.props.children}
        </tr>
      </thead>
    )
  }
}
