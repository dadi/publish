import proptypes from 'prop-types'
import React from 'react'

import Table from 'components/Table/Table'
import TableHead from 'components/Table/TableHead'
import TableHeadCell from 'components/Table/TableHeadCell'
import TableRow from 'components/Table/TableRow'
import TableRowCell from 'components/Table/TableRowCell'

/**
 * An advanced table that controls which properties of an object are displayed
 * and ensures that table headings and row cells stay in sync.
 */
export default class SyncTable extends React.Component {
  static propTypes = {
    /**
     * An array of objects containing the id, label and type of the columns to be displayed in the table.
     *
     *   ```js
     *   [
     *     {
     *        id: 'first_name',
     *        label: 'First name',
     *     }
     *   ]
     *   ```
     *
     */
    columns: proptypes.array,

    /**
     * A callback function that, when present, is used to render the contents of each cell in a row.
     * The callback receives as arguments the value of the object for the given column, the whole object, the column object and the index of the column.
     *
     * In the example below, `onRender` is used to wrap the first cell of every row with a link.
     *
     *  ```jsx
     *  <SyncTableRow
     *    data={document}
     *    onRender={(value, data, column, index) => {
     *      if (index === 0) {
     *        return (
     *          <a href={`/${collection.name}/document/edit/${data._id}`}>{value}</a>
     *        )
     *      }
     *
     *      return value
     *    }}
     *  />
     *  ````
     */
    onRender: proptypes.func,

    /**
     * A callback function that is fired whenever rows are selected. The function
     * will be called with an array of selected indices as the argument.
     */
    onSelect: proptypes.func,

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
    onSort: proptypes.func,

    /**
     * Whether rows are selectable. When `true`, check boxes will automatically be added to the table head and to each row.
     */
    selectable: proptypes.bool,

    /**
     * A hash map of the indices of the currently selected rows.
     */
    selectedRows: proptypes.object,

    /**
     * The maximum number of documents that can be selected at the same time.
     */
    selectLimit: proptypes.number,

    /**
     * The name of the column currently being used to sort the rows.
     */
    sortBy: proptypes.string,

    /**
     * The order currently being used to sort the rows by `sortBy`.
     */
    sortOrder: proptypes.oneOf(['asc', 'desc'])
  }

  static defaultProps = {
    columns: [],
    data: [],
    onSort: null,
    selectedRows: {},
    selectLimit: Infinity,
    selectable: true,
    sortBy: null,
    sortOrder: null
  }

  render() {
    const {
      columns,
      onSelect,
      renderColumnHeader,
      selectable,
      selectedRows,
      selectLimit,
      sortBy,
      sortOrder
    } = this.props

    return (
      <Table
        head={
          <TableHead>
            {columns.map((column, index) => {
              return (
                <TableHeadCell
                  sorted={sortBy === column.id && sortOrder}
                  key={column.label + index}
                >
                  {renderColumnHeader
                    ? renderColumnHeader(column)
                    : column.label}
                </TableHeadCell>
              )
            })}
          </TableHead>
        }
        onSelect={onSelect}
        selectable={selectable}
        selectLimit={selectLimit}
        selectedRows={selectedRows}
      >
        {this.renderRows()}
      </Table>
    )
  }

  renderRows() {
    const {columns, data, onSelect, onRender} = this.props

    return data.map((row, index) => {
      return (
        <TableRow key={index} onSelect={onSelect}>
          {columns.map((column, index) => {
            let value = row[column.id]

            // If there's a onRender callback, we run the value through it.
            if (typeof onRender === 'function') {
              value = onRender.call(this, row[column.id], row, column, index)
            }

            return <TableRowCell key={index}>{value}</TableRowCell>
          })}
        </TableRow>
      )
    })
  }
}
