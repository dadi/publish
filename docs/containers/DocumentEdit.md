`DocumentEdit`
==============

The interface for editing a document.

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

The ID of the document being edited.

- type: `string`


### `onBuildBaseUrl`

A callback to be used to obtain the base URL for the given page, as
determined by the view.

- type: `func`


### `onPageTitle`

A callback to be fired if the container wants to attempt changing the
page title.

- type: `func`


### `onRenderField`

A callback responsible for rendering individual fields.

- type: `func`


### `referencedField`

The name of a reference field currently being edited.

- type: `string`


### `section`

The current active section (if any).

- type: `string`


### `state`

The global state object.

- type: `object`

