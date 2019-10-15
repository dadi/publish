import {Checkbox} from '@dadi/edit-ui'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
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
     * The columns for the table head.
     */
    columns: proptypes.node,

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
     * Whether to make the table header sticky.
     */
    sticky: proptypes.bool
  }

  static defaultProps = {
    allowBulkSelection: true,
    allSelected: false,
    hasSelected: false,
    selectable: false
  }

  constructor(props) {
    super(props)

    this.markEvent = e => {
      e.__innerClick = true
    }
  }

  render() {
    const {
      allowBulkSelection,
      allSelected,
      children,
      columns,
      hasSelected,
      onSelect,
      renderRow,
      selectable,
      sticky
    } = this.props
    const isIndeterminate = !allSelected && hasSelected
    const headStyle = new Style(styles, 'head').addIf('sticky', sticky)

    return (
      <thead className={headStyle.getClasses()}>
        <tr>
          {selectable && (
            <TableHeadCell select={true}>
              <label
                className={styles['select-label']}
                onClick={this.markEvent}
                onMouseEnter={this.hoverOff}
                onMouseLeave={this.hoverOn}
              >
                <Checkbox
                  checked={isIndeterminate || allSelected}
                  className={styles.checkbox}
                  indeterminate={isIndeterminate ? 'true' : null}
                  onChange={onSelect}
                  style={allowBulkSelection ? null : {display: 'none'}}
                />
              </label>
            </TableHeadCell>
          )}
          {columns}
        </tr>

        {renderRow && (
          <tr>
            <th
              className={styles['head-row']}
              colSpan={columns.length + (selectable ? 1 : 0)}
            >
              {renderRow()}
            </th>
          </tr>
        )}
        {children}
      </thead>
    )
  }
}
