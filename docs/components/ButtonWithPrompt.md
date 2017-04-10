`ButtonWithPrompt`
==================

A simple call-to-action button with a prompt message. This component hijacks
the `onClick` prop of the button and fires it only when the user confirms
the action within the prompt.

Props
-----

### `position`

The position of the prompt relative to the button.

- type: `enum('left'|'right')`
- default value: `'right'`


### `promptCallToAction`

The text to be displayed in the call-to-action button.

- type: `string`


### `promptMessage`

The prompt message.

- type: `string`

