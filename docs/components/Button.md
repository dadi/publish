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

The text to be rendered inside the button.

- type: `node`


### `className`

Classes to append to the button element.

- type: `string`
- default value: `''`


### `disabled`

Whether the button is disabled.

- type: `bool`
- default value: `false`


### `href`

When present, the button will be rendered as an `a` element with the given
href.

- type: `string`


### `inGroup`

Whether the button is part of a group of buttons, and which position this particular button takes in the group. This is used to collapse the border-radius accordingly.

- type: `enum('left'|'middle'|'right')`


### `onClick`

Callback to be executed when the button is clicked.

- type: `func`


### `type`

Type/function of the button. When set to `mock`, a static element will be
rendered (as a `span`).

- type: `enum('button'|'mock'|'submit')`
- default value: `'button'`

