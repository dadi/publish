# Redux stores

We use [Redux](http://redux.js.org/docs/introduction/) to manage the global application state. We have 5 stores that hold the state of different parts of the application.

## 1. App

Holds generic app-wide state

| Property     | Type   | Description                                                                                           | Initial state                                                 |
|--------------|--------|-------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| `breakpoint` | String | Name of the current active breakpoint, as defined in the CSS files                                    | The name of the breakpoint that is active when the app starts |
| `config`     | Object | Object containing the Publish configuration parameters that have been made available to the front-end | `null`                                                        |

## 2. API

Holds state about APIs and collections.

| Property            | Type   | Description                                                                            | Initial state |
|---------------------|--------|----------------------------------------------------------------------------------------|---------------|
| `apis`              | Array  | List of all available APIs, including the schema for all their collections.            | `[]`          |
| `currentCollection` | Object | Collection schema for the currently active collection (as determined by the URL route) | `null`        |

## 3. Document

Holds the current active document (for document edit view)

| Property | Type     | Description                                                                    | Initial state |
|----------|----------|--------------------------------------------------------------------------------|---------------|
| `data`   | Object   | The object representing the fields and values of the document                  | `null`        |
| `status` | Constant | The status of the document, representing whether it's idle, loading or erroing | `STATUS_IDLE` |

## 4. Documents

Holds the current list of documents (for document list view)

| Property | Type     | Description                                                                    | Initial state |
|----------|----------|--------------------------------------------------------------------------------|---------------|
| `list`   | Array    | The list of documents                                                          | `null`        |
| `status` | Constant | The status of the document, representing whether it's idle, loading or erroing | `STATUS_IDLE` |

## 5. User

Holds state about the current user

| Property | Type   | Description                                                      | Initial state |
|----------|--------|------------------------------------------------------------------|---------------|
| `user`   | Object | An object representing the current signed in user, if one exists | `null`        |