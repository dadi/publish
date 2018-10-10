`DocumentListController`
========================

A controller bar for a list of documents.

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


### `filter`

The JSON-stringified object of active filters.

- type: `string`


### `newFilter`

Whether we are editing a new filter.

- type: `bool`


### `onAddNewFilter`

Whether a new filter has been added.

- type: `func`


### `onBuildBaseUrl`

A callback to be used to obtain the base URL for the given page, as
determined by the view.

- type: `func`


### `state`

The global state object.

- type: `object`

