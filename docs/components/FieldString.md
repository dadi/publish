`FieldString`
=============

Component for API fields of type String

Props
-----

### `error`

Whether the field contains a validation error.

- type: `bool`
- default value: `false`


### `forceValidation`

If true, validation will be executed immediately and not only when the
content of the field has changed.

- type: `bool`
- default value: `false`


### `onChange`

Callback to be executed when there is a change in the value of the field.

- type: `func`


### `onError`

Callback to be executed when there is a new validation error in the field.

- type: `func`


### `schema`

The field schema.

- type: `object`


### `value`

The field value.

- type: `string`
- default value: `''`

