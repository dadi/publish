`SyncTable`
===========

An advanced table that controls which properties of an object are displayed and ensures that table headings and row cells stay in sync.

Props
-----

### `children`

The list of `SyncTableRow` elements to be rendered as rows.

- type: `node`


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


### `selectable`

Whether rows are selectable. When `true`, check boxes will automatically be added to the table head and to each row.

- type: `bool`
- default value: `true`


### `sort`

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


### `sortBy`

The name of the column currently being used to sort the rows.

- type: `string`
- default value: `null`


### `sortOrder`

The order currently being used to sort the rows by `sortBy`.

- type: `enum('asc'|'desc')`
