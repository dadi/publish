`DocumentEdit`
==============

The interface for editing a document.

Props
-----

### `actions`

The global actions object.

- type: `object`


### `collection`

The name of the collection currently being listed.

- type: `string`


### `documentId`

The ID of the document being edited.

- type: `string`


### `group`

The name of the group where the current collection belongs (if any).

- type: `string`


### `onBuildBaseUrl`

A callback to be used to obtain the base URL for the given page, as
determined by the view.

- type: `func`


### `onGetRoutes`

A callback to be used to obtain the sibling document routes (edit, create and list), as
determined by the view.

- type: `func`


### `onPageTitle`

A callback to be fired if the container wants to attempt changing the
page title.

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

