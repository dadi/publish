`MediaListController`
=====================

A controller bar for a list of media.

Props
-----

### `filter`

The JSON-stringified object of active filters.

- type: `string`


### `group`

The name of the group where the current bucket belongs (if any).

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

