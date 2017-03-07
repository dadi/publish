`Button`
========

A simple call-to-action button.

Props
-----

### `accent`

Colour accent.

- type: `enum('system')`
- default value: `'system'`


### `children`

The text to be rendered inside the button.

- type: `node`


### `inGroup`

Whether the button is part of a group of buttons, and which position this particular button takes in the group. This is used to collapse the border-radius accordingly.

- type: `enum('left'|'middle'|'right')`


### `onClick`

Callback to be executed when the button is clicked.

- type: `func`


### `type`

Type/function of the button

- type: `enum('button'|'submit')`
- default value: `'button'`

