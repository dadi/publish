import React from 'react'
import proptypes from 'prop-types'

import Style from 'lib/Style'
import styles from './Table.css'

import TableRowCell from 'components/Table/TableRowCell'

/**
 * A table row.
 */
export default class TableRow extends React.Component {
  static propTypes = {
    /**
     * When `true`, any empty row cells will be filled with a text element saying *None*.
     *
     * **NOTE:** This prop is automatically passed down by `<Table/>`.
     */
    fillBlanks: proptypes.bool,

    /**
     * A callback function to be executed when the selection checkbox is clicked.
     */
    onSelect: proptypes.func,

    /**
     * Whether the row is selectable.
     */
    selectable: proptypes.bool,

    /**
     * If the table allows multiple rows to be selected (multi), or if it has
     * exceeded the maximum number of selected rows (multiDisabled), or if the
     * the table only allows a single row to be selected (single).
     */
    selectableMode: proptypes.oneOf(['multi', 'multiDisabled', 'single']),

    /**
     * Whether the row is currently selected.
     */
    selected: proptypes.bool,

    /**
     * The contents of the table row.
     */
    children: proptypes.node
  }

  static defaultProps = {
    fillBlanks: false,
    onSelect: null,
    selectable: true,
    selectableMode: 'multi',
    selected: false
  }

  handleSelectClick(event) {
    const {onSelect, tableIndex} = this.props

    if (typeof onSelect === 'function') {
      onSelect.call(this, tableIndex, event)
    }
  }

  handleSelectRow(event) {
    // If the click event happened on a link, we don't want to proceed
    // with selecting the row.
    if (event.target.tagName === 'A') {
      return
    }

    const {onSelect, tableIndex} = this.props

    if (typeof onSelect === 'function') {
      onSelect.call(this, tableIndex, !this.props.selected, event.shiftKey)
    }
  }

  renderChildren() {
    const {children, fillBlanks} = this.props

    return React.Children.map(children, child => {
      return React.cloneElement(child, {
        fillBlanks
      })
    })
  }

  render() {
    const {selectable, selectableMode, selected} = this.props
    const rowStyle = new Style(styles, 'row').addIf('row-selected', selected)

    return (
      <tr
        className={rowStyle.getClasses()}
        onClick={this.handleSelectRow.bind(this)}
      >
        {selectable && (
          <TableRowCell select={true}>
            <input
              checked={selected}
              className={styles.select}
              disabled={selectableMode === 'multiDisabled'}
              readOnly={true}
              type={selectableMode === 'single' ? 'radio' : 'checkbox'}
            />
          </TableRowCell>
        )}
        {this.renderChildren()}
      </tr>
    )
  }
}
