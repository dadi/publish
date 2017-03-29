`Notification`
==============

A notification strip, anchored to the bottom of the screen.

Props
-----

### `accent`

Colour accent.

- type: `enum('destruct'|'save'|'system')`
- default value: `'system'`


### `message`

The notification message.

- type: `string`


### `onHover`

A callback function to be fired when the user hovers over the
notification message. This will only be triggered if there are
no `options` specified.

- type: `func`


### `onOptionClick`

A callback function to be fired when one of the options is clicked.
The callback attached to the respective option will be sent as an
argument of this function.

- type: `func`


### `options`

An optional set of options to include as call-to-action in the
notification. The keys define the labels and the values define what
happens when the option is clicked. If defined as a function, it's
executed as a callback when the option is clicked (the option will be
rendered as a `<button>`). If defined as a string, it represents a link
to be followed when the option is clicked (the option is rendered as a
`<a>`).

- type: `object`


### `visible`

Whether the notification is currently visible.

- type: `bool`
- default value: `true`

