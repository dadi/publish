`DocumentListToolbar`
=====================

A toolbar used in a document list view.

Props
-----

### `collection`

The name of the collection being used.

- type: `string`


### `group`

The name of the group where the current collection belongs (if any).

- type: `string`


### `isReferencedField`

Whether the current list of documents refers to a nested document.

- type: `bool`
- default value: `false`


### `metadata`

The object containing metadata about the current query, as defined
in DADI API.

- type: `object`


### `onBulkAction`

A callback to be fired when the "Apply" button on the bulk actions
control is clicked.

- type: `func`


### `onReferenceDocumentSelect`

A callback to be fired when a reference document has been selected.

- type: `func`


### `selectedDocuments`

A list of the IDs of the currently selected documents.

- type: `array`

