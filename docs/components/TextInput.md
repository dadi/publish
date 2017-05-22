`TextInput`
===========

A text input field.

Props
-----

### `className`

Classes to append to the button element.

- type: `string`


### `id`

DOM ID for the input field.

- type: `string`


### `inLabel`

Whether the field is part of a `<Label/>` component. This makes it inherit certain CSS properties from the parent.

**NOTE:** This prop is automatically passed down by `<Label/>`.

- type: `bool`
- default value: `false`


### `multiline`

- default value: `false`


### `onBlur`

Callback to be executed when the text loses focus (onBlur event).

- type: `func`


### `onChange`

Callback to be executed when the text is changed (onChange event).

- type: `func`


### `onFocus`

Callback to be executed when the text gains focus (onFocus event).

- type: `func`


### `onKeyUp`

Callback to be executed when a key is pressed (onKeyUp event).

- type: `func`


### `placeholder`

Placeholder for the input field.

- type: `string`


### `readonly`

Whether the field is required.

**NOTE:** This prop is automatically passed down by `<Label/>`.

- type: `bool`
- default value: `false`


### `required`

Whether the field is required.

**NOTE:** This prop is automatically passed down by `<Label/>`.

- type: `bool`


### `type`

Type/function of the input field.

- type: `enum('email'|'multiline'|'number'|'password'|'tel'|'text'|'url')`
- default value: `'text'`


### `validation`

Callback to be executed onChange to validate field value.

- type: `func`


### `value`

Current value of the input field.

- type: `string`

