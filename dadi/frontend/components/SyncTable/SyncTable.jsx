'use strict'

import { h, Component } from 'preact'

import Style from 'lib/Style'

import Table, {
  TableHead,
  TableHeadCell,
  TableRow,
  TableRowCell
} from 'components/Table/Table'

//
// SyncTable
//
export default class SyncTable extends Component {
  static defaultProps = {
    columns: []
  }

  renderChildren() {
    // Pass `columns` to children
    return this.props.children.map(child => {
      child.attributes = child.attributes || {}
      child.attributes.columns = child.attributes.columns || this.props.columns

      return child
    })
  }

  render() {
    return (
      <Table selectable={this.props.selectable}>
        <TableHead>
          {this.props.columns.map(column => {
            return (
              <TableHeadCell>{column.label}</TableHeadCell>
            )
          })}
        </TableHead>

        {this.renderChildren()}
      </Table>
    )
  }
}

//
// SyncTable row
//
class SyncTableRow extends Component {
  render() {
    const {callback, columns, data} = this.props

    return (
      <TableRow {...this.props}>
        {columns.map((column, index) => {
          let value = data[column.id]

          // If there's a callback, we run the value through it
          if (typeof callback === 'function') {
            value = callback(data[column.id], data, column, index)
          }

          return (
            <TableRowCell>{value}</TableRowCell>
          )
        })}
      </TableRow>
    )
  }
}

export {SyncTableRow}
