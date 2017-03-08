'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Table.css'

/**
 * A simple table.
 */
export default class Table extends Component {
  static propTypes = {
    /**
     * When `true`, any empty row cells will be filled with a text element saying *None*.
     */
    fillBlanks: proptypes.bool,

    /**
     * Whether rows are selectable. When `true`, check boxes will automatically be added to the table head and to each row.
     */
    selectable: proptypes.bool,

    /**
     * The contents of the table.
     */
    children: proptypes.node
  }

  static defaultProps = {
    fillBlanks: true,
    selectable: true
  }

  constructor(props) {
    super(props)

    this.state.selectedRows = {}
  }

  handleHeadSelect(event) {
    const selected = event.target.checked

    let newSelectedRows = {}

    if (selected) {
      for (let i = 1; i < this.props.children.length; i++) {
        newSelectedRows[i] = true
      }
    }

    this.setState({
      selectedRows: newSelectedRows
    })
  }

  handleRowSelect(index, event) {
    const {selectedRows} = this.state
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

    this.setState({
      selectedRows: newSelectedRows
    })
  }

  groupChildren() {
    const {fillBlanks, selectable} = this.props
    const {selectedRows} = this.state
    const selectedRowsIndices = Object.keys(selectedRows).filter(index => selectedRows[index])

    let head = []
    let body = []
    
    this.props.children.forEach((child, index) => {
      let childAttributes = Object.assign({}, child.attributes, {
        fillBlanks,
        selectable,
        tableIndex: index
      })

      if (child.nodeName && child.nodeName.name === 'TableHead') {
        childAttributes.onSelect = this.handleHeadSelect.bind(this)
        childAttributes.allSelected = selectedRowsIndices.length === (this.props.children.length - 1)

        child.attributes = childAttributes

        head.push(child)
      } else {
        childAttributes.selected = selectedRows[index] === true
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

  render() {
    let children = this.groupChildren()

    return (
      <table class={styles.table}>
        {children.head}

        <tbody>
          {children.body}
        </tbody>
      </table>
    )
  }
}
