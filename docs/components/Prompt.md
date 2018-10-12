`Prompt`
========

A prompt dialog with a message and action button.

Props
-----

### `accent`

Colour accent.

- type: `enum('data'|'destruct'|'inherit'|'neutral'|'save'|'system')`
- default value: `'destruct'`


### `action` (required)

The text to be displayed on the action button

- type: `string`


### `children`

The child elements to be rendered next to the message.

- type: `node`


### `className`

Classes to append to the container element.

- type: `string`


### `onClick`

Callback to be executed when the button is clicked.

- type: `func`


### `position`

The position of the prompt tooltip.

- type: `enum('left'|'right')`
- default value: `'left'`

