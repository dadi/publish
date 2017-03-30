# Redux stores

We use [Redux](http://redux.js.org/docs/introduction/) to manage the global application state. We have 5 stores that hold the state of different parts of the application.

- [1. App](#1-app)
- [2. API](#2-api)
- [3. Document](#3-document)
- [4. Documents](#4-documents)
- [5. User](#5-user)

---

## 1. App

Holds generic app-wide state

| Property        | Type     | Description                                                                                           | Initial state                                                 |
|--------------   |----------|-------------------------------------------------------------------------------------------------------|---------------------------------------------------------------|
| `breakpoint`    | String   | Name of the current active breakpoint, as defined in the CSS files                                    | The name of the breakpoint that is active when the app starts |
| `config`        | Object   | Object containing the Publish configuration parameters that have been made available to the front-end | `null`                                                        |
| `networkStatus` | Constant | The status of the client internet connection and connection to the Publish server app                 | `NETWORK_OK`                                                  |
| `status`        | Constant | The status of the app, representing whether it's idle or loading                                      | `STATUS_IDLE`                                                 |

## 2. API

Holds state about APIs and collections.

| Property            | Type   | Description                                                                            | Initial state |
|---------------------|--------|----------------------------------------------------------------------------------------|---------------|
| `apis`              | Array  | List of all available APIs, including the schema for all their collections.            | `[]`          |
| `status`            | String | The status of the api config data, representing whether it's idle, loading or erroing  | `STATUS_IDLE` |

## 3. Document

Holds the current active document (for document edit view)

| Property           | Type     | Description                                                                        | Initial state |
|--------------------|----------|------------------------------------------------------------------------------------|---------------|
| `local`            | Object   | The object representing the state of the document as it's being edited             | `null`        |
| `peers`            | Object   | Other users connected through socket and observing or editing the current document | `null`        |
| `remote`           | Object   | The object representing the state of the document in the remote API                | `null`        |
| `remoteStatus`     | Constant | The status of the document, representing whether it's idle, loading or erroing     | `STATUS_IDLE` |
| `validationErrors` | Object   | Document field validation errors                                                   | `{}`          |

## 4. Documents

Holds the current list of documents (for document list view)

| Property | Type     | Description                                                                                                       | Initial state |
|----------|----------|-------------------------------------------------------------------------------------------------------------------|---------------|
| `list`   | Array    | The list of documents                                                                                             | `null`        |
| `query`  | String   | The current query parameters, used to distinguish between and empty collection and empty results based on a query | `null`        |
| `status` | Constant | The status of the document, representing whether it's idle, loading or erroing                                    | `STATUS_IDLE` |

## 5. User

Holds state about the current user

| Property  | Type   | Description                                                        | Initial state |
|-----------|--------|--------------------------------------------------------------------|---------------|
| `local`   | Object | The object representing the state of the user as it's being edited | `null`        |
| `remote`  | Object | The object representing the state of the user on the remote API    | `null`        |
