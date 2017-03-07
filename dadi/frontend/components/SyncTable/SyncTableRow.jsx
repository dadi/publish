'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import TableRow from 'components/Table/TableRow'
import TableRowCell from 'components/Table/TableRowCell'

/**
 * A row of `SyncTable`.
 */
export default class SyncTableRow extends Component {
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
     * **NOTE:** This prop is automatically passed down by `<SyncTable/>`.
     */
    columns: proptypes.array,

    /**
     * The object to be rendered as row. Only properties that exist in `columns` will be rendered.
     */
    data: proptypes.object,

    /**
     * Whether rows are selectable. When `true`, check boxes will automatically be added to the table head and to each row.
     *
     * **NOTE:** This prop is automatically passed down by `<SyncTable/>`.     
     */
    selectable: proptypes.bool,

    /**
     * A callback function that, when present, is used to render the contents of each cell in the row.
     * The callback receives as arguments the value of the object for the given column, the whole object, the column object and the index of the column.
     *
     * In the example below, `renderCallback` is used to wrap the first cell of every row with a link.
     *
     *  ```jsx
     *  <SyncTableRow
     *    data={document}
     *    renderCallback={(value, data, column, index) => {
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
    renderCallback: proptypes.func,

    /**
     * The name of the column currently being used to sort the rows.
     */
    sortBy: proptypes.string,

    /**
     * The order currently being used to sort the rows by `sortBy`.
     */
    sortOrder: proptypes.oneof(['asc', 'desc']),

    /**
     * The list of `SyncTableRow` elements to be rendered as rows.
     */
    children: proptypes.node
  }

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
