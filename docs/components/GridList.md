`GridList`
==========

Component for rendering API fields of type Image on a reference field select
list view.

Props
-----

### `data`

The available documents..

- type: `array`


### `href`

The link to follow when a document is clicked. When not defined,
`onClick` will be evaluated (see below).

- type: `string`


### `onClick`

The callback to be fired when a document is clicked. When not defined,
clicking on a document will select it, thus invoking the `onSelect`
callback instead.

- type: `func`


### `onSelect`

The callback to be fired when a document is selected.

- type: `func`


### `onSort`

The callback to be fired when the sort parameters are changed.

- type: `func`


### `selectLimit`

The maximum number of documents that can be selected.

- type: `number`


### `selectedRows`

The indexes of the currently selected documents.

- type: `array`


### `sortBy`

The name of the field to sort documents by.

- type: `string`


### `sortOrder`

The order used to sort the documents by the `sortBy` field.

- type: `enum('asc'|'desc')`

