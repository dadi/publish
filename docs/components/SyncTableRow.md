`SyncTableRow`
==============

A row of `SyncTable`.

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

**NOTE:** This prop is automatically passed down by `<SyncTable/>`.

- type: `array`


### `data`

The object to be rendered as row. Only properties that exist in `columns` will be rendered.

- type: `object`


### `renderCallback`

A callback function that, when present, is used to render the contents of each cell in the row.
The callback receives as arguments the value of the object for the given column, the whole object, the column object and the index of the column.

In the example below, `renderCallback` is used to wrap the first cell of every row with a link.

 ```jsx
 <SyncTableRow
   data={document}
   renderCallback={(value, data, column, index) => {
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


### `selectable`

Whether rows are selectable. When `true`, check boxes will automatically be added to the table head and to each row.

**NOTE:** This prop is automatically passed down by `<SyncTable/>`.

- type: `bool`


### `sortBy`

The name of the column currently being used to sort the rows.

- type: `string`


### `sortOrder`

The order currently being used to sort the rows by `sortBy`.

- type: `enum('asc'|'desc')`

