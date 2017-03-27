`DocumentEditToolbar`
=====================

A toolbar used in a document list view.

Props
-----

### `disabled`

Whether controls are disabled, preventing user interaction.

- type: `bool`
- default value: `false`


### `document`

The document currently being edited.

- type: `object`


### `method`

Whether the interface is editing an existing document or creating
a new one.

- type: `enum('edit'|'new')`


### `onSave`

A callback to be fired when the "Save" button is pressed.

- type: `func`


### `peers`

An array of peers currently editing the document.

- type: `object`

