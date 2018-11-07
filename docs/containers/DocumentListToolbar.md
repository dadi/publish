`DocumentListToolbar`
=====================

A toolbar used in a document list view.

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


### `onBuildBaseUrl`

A callback to be used to obtain the base URL for the given page, as
determined by the view.

- type: `func`


### `onDelete`

A callback to be called when the user has chosen to delete a selection
of documents. An array of document IDs will be sent as a parameter.

- type: `func`


### `referencedField`

The name of a reference field currently being edited.

- type: `string`


### `state`

The global state object.

- type: `object`

