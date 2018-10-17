`FieldReferenceEdit`
====================

Component for API fields of type Reference.

Props
-----

### `collection`

The name of the collection being edited, as per the URL.

- type: `string`


### `config`

A subset of the app config containing data specific to this field type.

- type: `object`


### `currentApi`

The schema of the API being used.

- type: `object`


### `currentCollection`

The schema of the collection being edited.

- type: `object`


### `displayName`

The human-friendly name of the field, to be displayed as a label.

- type: `string`


### `documentId`

The ID of the document being edited.

- type: `string`


### `error`

If defined, contains an error message to be displayed by the field.

- type: `string`


### `forceValidation`

Whether the field should be validated as soon as it mounts, rather than
waiting for a change event.

- type: `bool`


### `name`

The name of the field within the collection. May be a path using
dot-notation.

- type: `string`


### `onBuildBaseUrl`

A callback to be used to obtain the base URL for the given page, as
determined by the view.

- type: `func`


### `onChange`

A callback to be fired whenever the field wants to update its value to
a successful state. The function receives the name of the field and the
new value as arguments.

- type: `string`


### `onError`

A callback to be fired whenever the field wants to update its value to
or from an error state. The function receives the name of the field, a
Boolean value indicating whether or not there's an error and finally the
new value of the field.

- type: `string`


### `required`

Whether the field is required.

- type: `bool`


### `schema`

The field schema.

- type: `object`


### `value`

The field value.

- type: `bool`

