`ProfileEdit`
=============

The interface for editing a user profile.

Props
-----

### `onPageTitle`

A callback to be fired if the container wants to attempt changing the
page title.

- type: `func`


### `section`

The current active section (if any).

- type: `string`


### `sections`

All available sections.

- type: `array`
- default value: `[
  {
    slug: 'account',
    value: 'Account'
  },
  {
    slug: 'settings',
    value: 'Settings'
  },
  {
    slug: 'security',
    value: 'Security'
  }
]`

