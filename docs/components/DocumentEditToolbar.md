`DocumentEditToolbar`
=====================

A toolbar used in a document list view.

Props
-----

### `document`

The document currently being edited.

- type: `object`


### `hasConnectionIssues`

Whether the app is experiencing network connection issues.

- type: `bool`


### `hasValidationErrors`

Whether the document currently being edited has any validation errors.

- type: `bool`


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

