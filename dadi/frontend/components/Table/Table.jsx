'use strict'

import {h, Component} from 'preact'

import Style from 'lib/Style'
import styles from './Table.css'

import IconArrow from 'components/IconArrow/IconArrow'

//
// Table
//
export default class Table extends Component {
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

      if (child.nodeName.name === 'TableHead') {
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

//
// Table row
//
class TableRow extends Component {
  handleSelectClick(event) {
    const {onSelect, tableIndex} = this.props

    if (typeof onSelect === 'function') {
      onSelect(tableIndex, event)
    }
  }

  renderChildren() {
    return this.props.children.map(child => {
      child.attributes = child.attributes || {}
      child.attributes.fillBlanks = child.attributes.fillBlanks || this.props.fillBlanks

      return child
    })
  }

  render() {
    const {selected} = this.props

    let rowStyle = new Style(styles, 'row')

    rowStyle.addIf('row-selected', selected)

    return (
      <tr class={rowStyle.getClasses()}>
        {this.props.selectable &&
          <TableRowCell select={true}>
            <input
              checked={selected}
              class={styles.select}
              type="checkbox"
              onClick={this.handleSelectClick.bind(this)}
            />
          </TableRowCell>
        }
        {this.renderChildren()}
      </tr>
    )
  }
}

//
// Table row cell
//
class TableRowCell extends Component {
  render() {
    let children = this.props.children
    let cellStyle = new Style(styles, 'cell')

    cellStyle.addIf('select-cell', this.props.select)
    
    if (!children.length && this.props.fillBlanks) {
      children = <span class={styles['row-cell-blank']}>None</span>
    }

    return (
      <td class={cellStyle.getClasses()}>
        {children}
      </td>
    )
  }
}

//
// Table head
//
class TableHead extends Component {
  handleSelectClick(event) {
    const {onSelect} = this.props

    if (typeof onSelect === 'function') {
      onSelect(event)
    }
  }

  render() {
    const {allSelected} = this.props

    return (
      <thead class={styles.head}>
        {this.props.selectable &&
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

//
// Table head cell
//
class TableHeadCell extends Component {
  static defaultProps = {
    arrow: null,
    link: null
  }

  render() {
    const {arrow} = this.props
    let cellStyle = new Style(styles, 'cell', 'head-cell')

    cellStyle.addIf('select-cell', this.props.select)

    return (
      <th class={cellStyle.getClasses()}>
        {arrow && ['up', 'down'].includes(arrow) &&
          <IconArrow
            class={styles['head-cell-arrow']}
            width="10"
            height="10"
            direction={arrow}
          />
        }

        <span class={styles['head-cell-label']}>
          {this.props.children}
        </span>
      </th>
    )
  }
}

export {
  TableHead,
  TableHeadCell,
  TableRow, 
  TableRowCell
}
