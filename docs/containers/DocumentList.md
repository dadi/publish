`DocumentList`
==============

A table view with a list of documents.

Props
-----

### `actions`

The global actions object.

- type: `object`


### `collection`

The name of the collection currently being listed.

- type: `string`


### `documentId`

When on a reference field, contains the ID of the parent document.

- type: `string`


### `filter`

The JSON-stringified object of active filters.

- type: `string`


### `group`

The name of the group where the current collection belongs (if any).

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

