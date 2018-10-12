`TextInput`
===========

A text input field.

Props
-----

### `className`

Classes to append to the button element.

- type: `string`


### `heightType`

full | content | static

full: screen height
content: adapts to content
static: use rows prop

- type: `string`
- default value: `'static'`


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


### `onInput`

Callback to be executed when the input is changed in any way.

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


### `resizable`

Whether the field is resizable

- type: `bool`
- default value: `false`


### `rows`

Number of rows, if the heightType is set to `static`.

- type: `number`
- default value: `10`


### `type`

Type/function of the input field.

- type: `enum('email'|'multiline'|'number'|'password'|'tel'|'text'|'url')`
- default value: `'text'`


### `value`

Current value of the input field.

- type: `string`

