`Paginator`
===========

A generic pagination component.

Props
-----

### `currentPage`

Number of the current active page.

- type: `number`


### `linkCallback`

A callback function to be executed in order to generate the page links.
This function will receive the page number as an argument.

- type: `func`


### `maxPages`

Maximum number of page links to display.

- type: `number`
- default value: `10`


### `prevNext`

Whether to render `Prev` and `Next` links.

- type: `bool`
- default value: `true`


### `totalPages`

Number of available pages.

- type: `number`

