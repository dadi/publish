`Button`
========

A simple call-to-action button.

Props
-----

### `accent`

Colour accent.

- type: `enum('data'|'destruct'|'inherit'|'neutral'|'save'|'system')`
- default value: `'neutral'`


### `children`

The text/elements to be rendered inside the button.

- type: `node`


### `className`

Classes to append to the button element.

- type: `string`
- default value: `''`


### `disabled`

Whether the button is disabled.

- type: `bool`
- default value: `false`


### `forId`

When present, renders the button as a `<label>` with the `for` attribute
linked to the given ID.

- type: `string`


### `href`

When present, the button will be rendered as an `a` element with the given
href.

- type: `string`


### `inGroup`

Whether the button is part of a group of buttons, and which position this particular button takes in the group. This is used to collapse the border-radius accordingly.

- type: `enum('left'|'middle'|'right')`
- default value: `null`


### `isLoading`

Whether to display a loading state.

- type: `bool`


### `onClick`

Callback to be executed when the button is clicked.

- type: `func`


### `size`

The size variation of the button.

- type: `enum('normal'|'small')`
- default value: `'normal'`


### `type`

Type/function of the button. When set to `mock`, a static element will be
rendered (as a `span`).

- type: `enum('button'|'mock'|'submit')`
- default value: `'button'`

