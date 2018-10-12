`TableRow`
==========

A table row.

Props
-----

### `children`

The contents of the table row.

- type: `node`


### `fillBlanks`

When `true`, any empty row cells will be filled with a text element saying *None*.

**NOTE:** This prop is automatically passed down by `<Table/>`.

- type: `bool`
- default value: `false`


### `onSelect`

A callback function to be executed when the selection checkbox is clicked.

- type: `func`
- default value: `null`


### `selectable`

Whether the row is selectable.

- type: `bool`
- default value: `true`


### `selectableMode`

If the table allows multiple rows to be selected (multi), or if it has
exceeded the maximum number of selected rows (multiDisabled), or if the
the table only allows a single row to be selected (single).

- type: `enum('multi'|'multiDisabled'|'single')`
- default value: `'multi'`


### `selected`

Whether the row is currently selected.

- type: `bool`
- default value: `false`

