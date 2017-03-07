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
     * Whether all the rows in the table are currently selected.
     */
    allSelected: proptypes.bool,

    /**
     * Whether rows are selectable. When `true`, check boxes will automatically be added to the table head and to each row.
     */
    selectable: proptypes.bool,

    /**
     * The contents of the table head.
     */
    children: proptypes.node
  }

  static defaultProps = {
    allSelected: false,
    selectable: false
  }

  handleSelectClick(event) {
    const {onSelect} = this.props

    if (typeof onSelect === 'function') {
      onSelect(event)
    }
  }

  render() {
    const {allSelected, selectable} = this.props

    return (
      <thead class={styles.head}>
        {selectable &&
          <TableHeadCell select={true}>
            <input
              checked={allSelected}
              class={styles.select}
              type="checkbox"
              onClick={this.handleSelectClick.bind(this)}
            />
          </TableHeadCell>
        }
        {this.props.children}
      </thead>
    )
  }
}
