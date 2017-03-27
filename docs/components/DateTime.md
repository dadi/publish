`DateTime`
==========

The time elapsed since a given event, as an automatically updated string.

Props
-----

### `date`

The date to be displayed. This can be in one of three formats:

- A Date() object
- A numeric timestamp
- A string representation of a date

- type: `union(object|number|string)`


### `format`

The format used to display the date. Conforms to fecha's format
tokens: https://github.com/taylorhakes/fecha#formatting-tokens

- type: `string`
- default value: `'default'`


### `fromFormat`

If present, the date received as prop will be parsed using the
given format as a reference.

- type: `string`
- default value: `null`


### `relative`

Whether to display relative dates (e.g. an hour ago).
Overrides the `format` prop.

- type: `bool`
- default value: `false`

