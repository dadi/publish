`SyncTable`
===========

An advanced table that controls which properties of an object are displayed and ensures that table headings and row cells stay in sync.

Props
-----

### `columns`

An array of objects containing the id and label of the columns to be displayed in the table.

  ```js
  [
    {
       id: 'first_name',
       label: 'First name'
    }
  ]
  ```

- type: `array`
- default value: `[]`


### `data`

- default value: `[]`


### `onRender`

A callback function that, when present, is used to render the contents of each cell in a row.
The callback receives as arguments the value of the object for the given column, the whole object, the column object and the index of the column.

In the example below, `onRender` is used to wrap the first cell of every row with a link.

 ```jsx
 <SyncTableRow
   data={document}
   onRender={(value, data, column, index) => {
     if (index === 0) {
       return (
         <a href={`/${collection.name}/document/edit/${data._id}`}>{value}</a>
       )
     }

     return value
   }}
 />
 ````

- type: `func`


### `onSelect`

A callback function that is fired whenever rows are selected. The function
will be called with an array of selected indices as the argument.

- type: `func`


### `onSort`

A callback function that is used to render the links of the table headings that allow the sort field and order to be changed.
The callback receives as arguments the column label, the column id and the sort order that the heading should link to.

 ```jsx
  <SyncTable
    columns={tableColumns}
    sortable={true}
    sortBy={state.document.sortBy}
    sortOrder={state.document.sortOrder}
    sort={(value, sortBy, sortOrder) => {
      return (
        <a href={`/${collection.name}/documents?sort=${sortBy}&order=${sortOrder}`}>
          {value}
        </a>
      )
    }}
  >
 ````

- type: `func`
- default value: `null`


### `selectLimit`

The maximum number of documents that can be selected at the same time.

- type: `number`
- default value: `Infinity`


### `selectable`

Whether rows are selectable. When `true`, check boxes will automatically be added to the table head and to each row.

- type: `bool`
- default value: `true`


### `selectedRows`

A hash map of the indices of the currently selected rows.

- type: `custom`
- default value: `{}`


### `sortBy`

The name of the column currently being used to sort the rows.

- type: `string`
- default value: `null`


### `sortOrder`

The order currently being used to sort the rows by `sortBy`.

- type: `enum('asc'|'desc')`
- default value: `null`

