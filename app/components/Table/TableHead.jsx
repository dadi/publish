import {Checkbox} from '@dadi/edit-ui'
import proptypes from 'prop-types'
import React from 'react'
import styles from './Table.css'
import TableHeadCell from 'components/Table/TableHeadCell'

/**
 * A table head.
 */
export default class TableHead extends React.Component {
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
      <thead className={styles.head}>
        <tr>
          {selectable && (
            <TableHeadCell select={true}>
              <label
                className={styles['select-label']}
                onClick={e => e.stopPropagation()}
                onMouseEnter={this.hoverOff}
                onMouseLeave={this.hoverOn}
              >
                <Checkbox
                  className={styles.checkbox}
                  indeterminate={(!allSelected && hasSelected).toString()}
                  onChange={this.handleSelectClick.bind(this)}
                  style={allowBulkSelection ? null : {display: 'none'}}
                  value={allSelected}
                />
              </label>
            </TableHeadCell>
          )}
          {this.props.children}
        </tr>
      </thead>
    )
  }
}
