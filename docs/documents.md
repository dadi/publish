## Documents

This document describes how documents are displayed, validated and persisted in various forms. Reading the [document store documentation](stores.md#1-3-document) is also highly recommended.

### 1. Local vs. remote document

When loading a document to be edited, Publish grabs its content by querying the remote API. That payload is assigned to the `remote` property in the document store by firing the appropriate Redux action (`setRemoteDocument()`). This copy of the document will *never* be modified locally, and it will be considered the up-to-date version of the document as it exists on the remote API.

Any changes made to the document via the editor interface will be stored in the `local` property of the document store, by firing the `updateLocalDocument()` action. This property will contain an object representing the changes (or a diff) to `document.remote`. At any point in time, we can obtain the current state of the document by merging these two properties together:

```js
// Example
const newDocument = Object.assign({}, document.remote, document.local)
```

When creating a new document, `document.remote` will be `{}`.

#### 1.1. Local storage

Every local change via `updateLocalDocument()` saves a copy of that update on local storage, if the browser supports it. This allows editors to update a field, leave the editor interface and still have their changes persisted on their machine, effectively creating a draft of that document that they can later publish or discard.

Publish can save local changes to multiple documents, as each document gets its own local storage key. This key is computed as follows:

- for existing documents, the unique id (`_id`) is used as a key;
- for new documents, a combination of the collection name and the collection group are used as a key.

When loading the document editing interface, Publish first checks to see whether there are any local changes for that document to rescue from local storage. If there are, they will be used as the initial state of `document.local`. Otherwise, this will be `{}`, meaning that there are no local changes to the state of `document.remote`.


### 2. Displaying documents

The [DocumentEdit container](containers/DocumentEdit.md) provides the interface that allows documented to be viewed and edited. Fields are displayed as per the routine described in the [field components document](field-components.md). This container simply provides a way of displaying and validating documents, it does *not* handle any save or delete operations. For this, you'll need a toolbar component, most likely [`DocumentEditToolbar`](containers/DocumentEditToolbar.md).

### 3. Validating documents

Each field has its own validation routine and is responsible for validating itself. This process doesn't happen automatically as soon as the field is rendered, though, because this would mean flagging validation errors before the user has had a chance to interact with the document. For example, imagine a collection with some required fields — if validation happened immediately after the editing interface loads, a new (and consequently empty) document would fail validation on those required fields.

To get around that, Publish passes a `forceValidation` prop to each field. When it's `false` (the value it starts with), fields can decide for themselves whether they want to trigger validation straight away or wait for user input (e.g. `FieldString` only flags validation errors once the field has gained focus at least once). When it's `true`, fields are expected to validate immediately.

More on this prop below.

#### 3.1. Validation errors

Validation errors are stored in the `validationErrors` property of the document store. It consists of a *nullable* object that maps field names to validation errors and, optionally, their message.

The initial state of this property is `null`, which means that the result of validating the document is **undetermined**. At this point, it hasn't been validated yet, meaning that fields haven't received the `forceValidation` prop described above and therefore they may contain invalid state that hasn't yet been flagged. This state is fundamentally different to when `validationErrors` is `{}`, which means that the document has been validated and no errors have been found.

Note that `validationErrors` works as a hash map, so when a field has had validation errors that have been fixed, its key will not be cleared from the object, but its value is simply made falsy (for performance reasons).

Below are some examples of possible states for `validationErrors` and what they mean to the document flow.

```js
// State of the document is undetermined. We don't know yet whether there are any validation errors.
const validationErrors1 = null

// Document has been validated, no validation errors have been found.
const validationErrors2 = {}

// Document has been validated, no validation errors have been found.
const validationErrors3 = {
  firstName: false,
  lastName: false
}

// Document has been validated, one of the fields has a validation error.
const validationErrors4 = {
  firstName: false,
  lastName: true
}

// Document has been validated, one of the fields has a validation error with a message.
const validationErrors5 = {
  email: 'must be a valid email address'
}
```

### 4. Saving documents

As mentioned before, saving is handled by [`DocumentEditToolbar`](containers/DocumentEditToolbar.md). Because of the possibly undeterminate state of `validationErrors`, we can't trigger a save operation directly on user input because we might be trying to save a document with validation issues.

Instead, when the user hits the *Save document* button we merely register their intention of saving the document, by firing the `registerSaveAttempt()` action. This will increment a `saveAttempts` property on the document store, which starts at `0`. A consequence of incrementing this value is that `DocumentEdit` will now know that the user has tried to save the document, so it's not acceptable anymore to have an undeterminate state for `validationErrors`.

`DocumentEdit` will act on this and pass `forceValidation` as `true` to all the fields, forcing them to report any validation issues. If they do, the save operation will be aborted. If all is well, the save can proceed and a call is finally made to the remote API.