`Table`
=======

A simple table.

Props
-----

### `children`

The contents of the table.

- type: `node`


### `fillBlanks`

When `true`, any empty row cells will be filled with a text element
saying *None*.

- type: `bool`
- default value: `true`


### `onSelect`

A callback function that is fired whenever rows are selected. The
function will be called with an array of selected indices as the
argument.

- type: `func`


### `selectLimit`

The maximum number of rows that can be selected at the same time.

- type: `number`
- default value: `Infinity`


### `selectable`

Whether rows are selectable. When `true`, check boxes will automatically
be added to the table head and to each row.

- type: `bool`
- default value: `true`


### `selectedRows`

A hash map of the indices of the currently selected rows.

- type: `custom`
- default value: `{}`

