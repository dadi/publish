'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import {Keyboard} from 'lib/keyboard'

import Style from 'lib/Style'
import styles from './Table.css'

/**
 * A simple table.
 */
export default class Table extends Component {
  static propTypes = {
    /**
     * The contents of the table.
     */
    children: proptypes.node,

    /**
     * When `true`, any empty row cells will be filled with a text element saying *None*.
     */
    fillBlanks: proptypes.bool,

    /**
     * A callback function that is fired whenever rows are selected. The function
     * will be called with an array of selected indices as the argument.
     */
    onSelect: proptypes.func,

    /**
     * Whether rows are selectable. When `true`, check boxes will automatically be added to the table head and to each row.
     */
    selectable: proptypes.bool,

    /**
     * A hash map of the indices of the currently selected rows.
     */
    selectedRows: proptypes.obj
  }

  static defaultProps = {
    fillBlanks: true,
    selectedRows: {},
    selectable: true
  }

  constructor(props) {
    super(props)

    this.keyboard = new Keyboard()
  }

  handleHeadSelect(event) {
    const {children, onSelect} = this.props
    const selected = event.target.checked

    let newSelectedRows = {}

    if (selected) {
      for (let i = 0; i < (children.length - 1); i++) {
        newSelectedRows[i] = true
      }
    }

    if (typeof onSelect === 'function') {
      onSelect.call(this, newSelectedRows)
    }
  }

  handleRowSelect(index, event) {
    const {onSelect, selectedRows} = this.props
    const selected = event.target.checked
    const isRangeSelection = event.shiftKey
    const selectedRowsIndices = Object.keys(selectedRows)

    let newSelectedRows = Object.assign({}, selectedRows, {
      [index]: selected
    })

    if (isRangeSelection && selectedRowsIndices.length) {
      let rangeBoundary = Infinity

      selectedRowsIndices.sort().forEach(selectedRowIndex => {
        if (Math.abs(rangeBoundary - index) > Math.abs(selectedRowIndex - index)) {
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

    if (typeof onSelect === 'function') {
      onSelect.call(this, newSelectedRows)
    }
  }

  groupChildren() {
    const {
      children,
      fillBlanks,
      selectable,
      selectedRows
    } = this.props
    const selectedRowsIndices = Object.keys(selectedRows).filter(index => selectedRows[index])

    let head = []
    let body = []

    // Right at the start, we check to see if the table has a head. This will
    // influence the indices being passed down to the children, since we want
    // the first row to always have the index 0.
    const tableHasHead = this.props.children.find(child => {
      return child.nodeName && child.nodeName.name === 'TableHead'
    })

    children.forEach((child, index) => {
      let childAttributes = Object.assign({}, child.attributes, {
        fillBlanks,
        selectable
      })

      if (child.nodeName && child.nodeName.name === 'TableHead') {
        childAttributes.onSelect = this.handleHeadSelect.bind(this)
        childAttributes.allSelected = selectedRowsIndices.length === (children.length - 1)

        child.attributes = childAttributes

        head.push(child)
      } else {
        const rowIndex = tableHasHead ? index - 1 : index

        childAttributes.tableIndex = rowIndex
        childAttributes.selected = selectedRows[rowIndex] === true
        childAttributes.onSelect = this.handleRowSelect.bind(this)

        child.attributes = childAttributes

        body.push(child)
      }
    })

    return {
      head,
      body
    }
  }

  componentDidMount() {
    this.keyboard.on('space+a').do(cmd => {
      console.log(cmd.pattern)
      // Trigger something
    })
  }

  componentWillUnmount() {
    // Clear keyboard
    this.keyboard.off()
  }

  render() {
    let children = this.groupChildren()

    return (
      <table class={styles.table}>
        {children.head}
        <tbody>{children.body}</tbody>
      </table>
    )
  }
}
