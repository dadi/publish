`MediaEdit`
===========

The interface for editing a media.

Props
-----

### `actions`

The global actions object.

- type: `object`


### `bucket` (required)

The name of the bucket currently being listed.

- type: `string`


### `group`

The name of the group where the current bucket belongs (if any).

- type: `string`


### `mediaId`

The ID of the media being edited.

- type: `string`


### `onBuildBaseUrl`

A callback to be used to obtain the base URL for the given page, as
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


