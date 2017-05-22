`DocumentFilter`
================

A document filter.

Props
-----

### `config`

App config.

- type: `object`


### `field`

The slug of the field being filtered.

- type: `string`


### `fields`

An object containing the fields available for the given collection.
Keys represent field slugs and values hold the field schema.

- type: `object`


### `filters`

An object containing the current applied filters.

- type: `object`


### `index`

The index of the current filter within a list of filters.

- type: `number`


### `onRemove`

A callback to be fired when the filter is removed.

- type: `func`


### `onUpdate`

A callback to be fired when the filter is updated.

- type: `func`


### `type`

The type of expression used by the filter.

- type: `enum('$eq'|'$ne'|'$nin'|'$in'|'$gt'|'$gte'|'$lt'|'$lte')`


### `value`

The value used by the filter.

- type: `string`

