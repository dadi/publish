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


### `filter`

The JSON-stringified object of active filters.

- type: `string`


### `group`

The name of the group where the current collection belongs (if any).

- type: `string`


### `onPageTitle`

A callback to be fired if the container wants to attempt changing the
page title.

- type: `func`


### `order`

The order used to sort the documents by the `sort` field.

- type: `enum('asc'|'desc')`


### `page`

The number of the current active page.

- type: `number`


### `sort`

The name of the field currently being used to sort the documents.

- type: `string`


### `state`

The global state object.

- type: `object`

