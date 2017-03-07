'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Table from 'components/Table/Table'
import TableHead from 'components/Table/TableHead'
import TableHeadCell from 'components/Table/TableHeadCell'

/**
 * An advanced table that controls which properties of an object are displayed and ensures that table headings and row cells stay in sync.
 */
export default class SyncTable extends Component {
  static propTypes = {
    /**
     * An array of objects containing the id and label of the columns to be displayed in the table.
     *
     *   ```js
     *   [
     *     {
     *        id: 'first_name',
     *        label: 'First name'
     *     }
     *   ]
     *   ```
     *
     */
    columns: proptypes.array,

    /**
     * Whether rows are selectable. When `true`, check boxes will automatically be added to the table head and to each row.
     */
    selectable: proptypes.bool,

    /**
     * A callback function that is used to render the links of the table headings that allow the sort field and order to be changed.
     * The callback receives as arguments the column label, the column id and the sort order that the heading should link to.
     *
     *  ```jsx
     *   <SyncTable
     *     columns={tableColumns}
     *     sortable={true}
     *     sortBy={state.document.sortBy}
     *     sortOrder={state.document.sortOrder}
     *     sort={(value, sortBy, sortOrder) => {
     *       return (
     *         <a href={`/${collection.name}/documents?sort=${sortBy}&order=${sortOrder}`}>
     *           {value}
     *         </a>
     *       )
     *     }}
     *   >
     *  ````
     */
    sort: proptypes.func,

    /**
     * The name of the column currently being used to sort the rows.
     */
    sortBy: proptypes.string,

    /**
     * The order currently being used to sort the rows by `sortBy`.
     */
    sortOrder: proptypes.oneOf(['asc', 'desc']),

    /**
     * The list of `SyncTableRow` elements to be rendered as rows.
     */
    children: proptypes.node
  }

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
