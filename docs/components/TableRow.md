`TableRow`
==========

A table row.

Props
-----

### `children`

The contents of the table row.

- type: node


### `fillBlanks`

When `true`, any empty row cells will be filled with a text element saying *None*.

**NOTE:** This prop is automatically passed down by `<Table/>`.

- type: bool
- default value: `false`


### `onSelect`

A callback function to be executed when the selection checkbox is clicked.

- type: func
- default value: `null`


### `selected`

Whether the row is currently selected.

- type: bool
- default value: `false`

