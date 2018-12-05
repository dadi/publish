`DocumentTableList`
===================

A table view for listing documents.

Props
-----

### `api`

The API to operate on.

- type: `object`


### `collection`

The collection to operate on.

- type: `object`


### `collectionParent`

The parent collection to operate on, when dealing with a reference field.

- type: `object`


### `config`

The application configuration object.

- type: `object`


### `documentId`

When on a reference field, contains the ID of the parent document.

- type: `string`


### `documents`

The list of documents to display.

- type: `array`


### `onBuildBaseUrl`

A callback to be used to obtain the base URL for the given page, as
determined by the view.

- type: `func`


### `onSelect`

A callback to be fired with a new document selection.

- type: `func`


### `order`

The order used to sort the documents by the `sort` field.

- type: `enum('asc'|'desc')`


### `referencedField`

The name of a reference field currently being edited (if any).

- type: `string`


### `selectLimit`

The maximum number of documents that can be selected.

- type: `number`


### `selectedDocuments`

A hash map of the indices of the currently selected documents.

- type: `array`


### `sort`

The name of the field currently being used to sort the documents.

- type: `string`

