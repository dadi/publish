`FieldMediaReferenceSelect`
===========================

Component for rendering API fields of type Media on a reference field select
list view.

Props
-----

### `config`

A subset of the app config containing data specific to this field type.

- type: `object`


### `data`

The available documents..

- type: `array`


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

