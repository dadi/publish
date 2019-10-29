import proptypes from 'prop-types'
import React from 'react'
import styles from './Table.css'

/**
 * A simple table.
 */
export default class Table extends React.Component {
  static propTypes = {
    /**
     * The contents of the table.
     */
    children: proptypes.node,

    /**
     * When `true`, any empty row cells will be filled with a text element
     * saying *None*.
     */
    fillBlanks: proptypes.bool,

    /**
     * An optional table head.
     */
    head: proptypes.node,

    /**
     * A callback function that is fired whenever rows are selected. The
     * function will be called with an array of selected indices as the
     * argument.
     */
    onSelect: proptypes.func,

    /**
     * Whether rows are selectable. When `true`, check boxes will automatically
     * be added to the table head and to each row.
     */
    selectable: proptypes.bool,

    /**
     * The maximum number of rows that can be selected at the same time.
     */
    selectLimit: proptypes.number,

    /**
     * A hash map of the indices of the currently selected rows.
     */
    selectedRows: proptypes.object
  }

  static defaultProps = {
    fillBlanks: true,
    selectable: true,
    selectLimit: Infinity,
    selectedRows: {}
  }

  constructor(props) {
    super(props)

    this.handleHeadSelect = this.handleHeadSelect.bind(this)
  }

  deselectAll() {
    const {onSelect, selectedRows} = this.props
    const selection = Object.keys(selectedRows).reduce((selection, index) => {
      selection[index] = false

      return selection
    }, {})

    if (typeof onSelect === 'function') {
      onSelect.call(this, selection)
    }
  }

  handleHeadSelect() {
    const {selectedRows} = this.props
    const isAnySelected = Object.keys(selectedRows).find(
      index => selectedRows[index]
    )

    if (isAnySelected) {
      this.deselectAll()
    } else {
      this.selectAll()
    }
  }

  handleRowSelect(index, selected, isRangeSelection) {
    const {onSelect, selectLimit, selectedRows} = this.props
    const selectedRowsIndices = Object.keys(selectedRows)

    let newSelectedRows = {}

    // If only one row can be selected at a time, the logic is quite simple:
    // the new object of selected rows contains only the index that has been
    // received.
    if (selectLimit === 1) {
      newSelectedRows = {
        [index]: true
      }
    } else {
      // Otherwise, we need to merge the previous state of selected rows with
      // the new selection.
      newSelectedRows = Object.assign({}, selectedRows, {
        [index]: selected
      })

      if (isRangeSelection && selectedRowsIndices.length) {
        let rangeBoundary = Infinity

        selectedRowsIndices.sort().forEach(selectedRowIndex => {
          if (
            Math.abs(rangeBoundary - index) > Math.abs(selectedRowIndex - index)
          ) {
            rangeBoundary = selectedRowIndex
          }
        })

        const selectDown = rangeBoundary >= index
        const rangeFrom = selectDown ? index : rangeBoundary
        const rangeTo = selectDown ? rangeBoundary : index

        for (let i = rangeFrom; i <= rangeTo; i++) {
          newSelectedRows[i] = selected
        }
      }
    }

    if (typeof onSelect === 'function') {
      onSelect.call(this, newSelectedRows)
    }
  }

  render() {
    return (
      <table className={styles.table}>
        {this.renderHead()}

        <tbody>{this.renderRows()}</tbody>
      </table>
    )
  }

  renderHead() {
    const {
      children,
      fillBlanks,
      head,
      selectable,
      selectedRows,
      selectLimit
    } = this.props

    if (!head) return null

    const selectedRowsIndices = Object.keys(selectedRows).filter(
      index => selectedRows[index]
    )
    const numRows = React.Children.count(children)
    const newProps = {
      allowBulkSelection: selectLimit > numRows,
      allSelected: selectedRowsIndices.length === numRows,
      fillBlanks,
      hasSelected: selectedRowsIndices.length > 0,
      onSelect: this.handleHeadSelect,
      selectable,
      selectLimit
    }

    return React.cloneElement(head, newProps)
  }

  renderRows() {
    const {
      children,
      fillBlanks,
      head,
      selectable,
      selectedRows,
      selectLimit
    } = this.props
    const commonProps = {
      fillBlanks,
      selectable,
      selectLimit
    }

    return React.Children.map(children, (child, index) => {
      const rowIsSelected = Boolean(selectedRows[index])
      const selectionExhausted = selectedRows.length >= selectLimit

      const newProps = {
        ...commonProps,
        onSelect: this.handleRowSelect.bind(this),
        selected: rowIsSelected,
        selectableMode: 'multi',
        tableIndex: index
      }

      if (selectLimit === 1) {
        newProps.selectableMode = 'single'
      } else if (selectionExhausted && !rowIsSelected) {
        newProps.selectableMode = 'multiDisabled'
      }

      return React.cloneElement(child, newProps)
    })
  }

  selectAll() {
    const {children, onSelect} = this.props

    const newSelectedRows = {}

    for (let i = 0; i < children.length; i++) {
      newSelectedRows[i] = true
    }

    if (typeof onSelect === 'function') {
      onSelect.call(this, newSelectedRows)
    }
  }
}
