import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Table.css'

/**
 * A table head cell.
 */
export default class TableHeadCell extends React.Component {
  static propTypes = {
    /**
     * Whether the table is sorted by this column.
     */
    sorted: proptypes.oneOf(['asc', 'desc']),

    /**
     * Whether the row is used to hold a selection checkbox.
     */
    select: proptypes.bool
  }

  static defaultProps = {
    sorted: false
  }

  render() {
    const {sorted, children, select} = this.props
    const cellStyle = new Style(styles, 'cell')
      .addIf('head-cell-sorted', sorted)
      .addIf('select-cell', select)

    return <th className={cellStyle.getClasses()}>{children}</th>
  }
}
