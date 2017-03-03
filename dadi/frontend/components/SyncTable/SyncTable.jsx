'use strict'

import {h, Component} from 'preact'

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
    columns: [],
    selectable: true,
    sort: null,
    sortBy: null,
    sortOrder: null
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
    const {
      columns,
      selectable,
      sort,
      sortBy,
      sortOrder
    } = this.props

    return (
      <Table selectable={selectable}>
        <TableHead>
          {columns.map(column => {
            let content = column.label
            let arrow = null
            let linkSortOrder = 'asc'

            if (typeof sort === 'function') {
              if (sortBy === column.id) {
                if (sortOrder === 'desc') {
                  arrow = 'down'
                  linkSortOrder = 'asc'
                } else {
                  arrow = 'up'
                  linkSortOrder = 'desc'
                }

                arrow = (sortOrder === 'desc') ? 'down' : 'up'
              }

              content = sort(content, column.id, linkSortOrder)
            }

            return (
              <TableHeadCell arrow={arrow}>{content}</TableHeadCell>
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
    const {columns, data, renderCallback} = this.props

    return (
      <TableRow {...this.props}>
        {columns.map((column, index) => {
          let value = data[column.id]

          // If there's a renderCallback, we run the value through it
          if (typeof renderCallback === 'function') {
            value = renderCallback(data[column.id], data, column, index)
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
