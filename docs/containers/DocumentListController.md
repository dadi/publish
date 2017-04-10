`DocumentListController`
========================

A controller bar for a list of documents.

Props
-----

### `filter`

The JSON-stringified object of active filters.

- type: `string`


### `group`

The name of the group where the current collection belongs (if any).

- type: `string`


### `newFilter`

Whether we are editing a new filter.

- type: `bool`


### `onAddNewFilter`

Whether a new filter has been added.

- type: `func`


### `parentDocumentId`

When on a reference field, contains the ID of the parent document.

- type: `string`


### `referencedField`

The name of a reference field currently being edited.

- type: `string`


### `state`

The global state object.

- type: `object`

