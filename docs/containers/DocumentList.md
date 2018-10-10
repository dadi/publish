`DocumentList`
==============

A table view with a list of documents.

Props
-----

### `actions`

The global actions object.

- type: `object`


### `api`

The API to operate on.

- type: `object`


### `collection`

The collection to operate on.

- type: `object`


### `collectionParent`

The parent collection to operate on, when dealing with a reference field.

- type: `object`


### `documentId`

When on a reference field, contains the ID of the parent document.

- type: `string`


### `filter`

The JSON-stringified object of active filters.

- type: `string`


### `onBuildBaseUrl`

A callback to be used to obtain the base URL for the given page, as
determined by the view.

- type: `func`


### `onPageTitle`

A callback to be fired if the container wants to attempt changing the
page title.

- type: `func`
- default value: `function () {}`


### `order`

The order used to sort the documents by the `sort` field.

- type: `enum('asc'|'desc')`


### `page`

The number of the current active page.

- type: `number`


### `referencedField`

The name of a reference field currently being edited.

- type: `string`


### `sort`

The name of the field currently being used to sort the documents.

- type: `string`


### `state`

The global state object.

- type: `object`

