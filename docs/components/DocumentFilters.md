`DocumentFilters`
=================

A list of document filters.

Props
-----

### `collection`

The schema of the collection being filtered.

- type: `object`


### `config`

App config.

- type: `object`


### `filter` (required)

The JSON-stringified object of filters currently applied.

- type: `string`


### `forceNewFilters`

Counter to mark the addition of new filters.

- type: `number`


### `updateUrlParams`

Change callback method to trigger rendering new url parameters.

- type: `func`

