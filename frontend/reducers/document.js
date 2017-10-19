'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const initialState = {
  // An array of field names whose values will never be persisted to local
  // storage. Useful for sensitive data like passwords.
  fieldsNotPersistedInLocalStorage: [],

  // Whether some or all of the contents of `local` have been loaded from
  // local storage, rather than filled in manually.
  loadedFromLocalStorage: false,

  // A map of local changes to the remote document, with field names as keys.
  local: null,

  // An array of people working on the current document.
  peers: null,

  // The entire document being edited as it exists on the remote API.
  remote: null,

  // The status of the fetch operation for the remote document.
  remoteStatus: Constants.STATUS_IDLE,

  // The number of times the user has tried to save the current document.
  saveAttempts: 0,

  // When `validationErrors` is `null`, it means that we don't know whether the
  // document was validated successfully, because we haven't forced fields to
  // validate themselves (with the `forceValidate` prop).
  //
  // When it's `{}`, however, it means we have validated the document and there
  // are no errors found.
  validationErrors: null
}

export default function document (state = initialState, action = {}) {
  switch (action.type) {

    // Document action: attempt to save document
    case Types.ATTEMPT_SAVE_DOCUMENT:
      return {
        ...state,
        saveAttempts: state.saveAttempts + 1
      }

    // Document action: clear remote document
    case Types.CLEAR_REMOTE_DOCUMENT:
      return initialState

    // Document action: discard unsaved changes
    case Types.DISCARD_UNSAVED_CHANGES:
      return {
        ...state,
        loadedFromLocalStorage: false,
        local: {},
        validationErrors: null
      }

    // Documents action: delete documents
    case Types.DELETE_DOCUMENTS:
      if (state.remote && action.ids.includes(state.remote._id)) {
        return initialState
      }

      return state

    // Document action: save document
    case Types.SAVE_DOCUMENT:
      return {
        ...state,
        remoteStatus: Constants.STATUS_IDLE
      }

    // Document action: set document peers
    case Types.SET_DOCUMENT_PEERS:
      return {
        ...state,
        peers: action.peers
      }

    // Document action: set errors from remote API
    case Types.SET_ERRORS_FROM_REMOTE_API:
      let newValidationErrors = {}

      action.errors.forEach(error => {
        newValidationErrors[error.field] = error.message || true
      })

      return {
        ...state,
        validationErrors: {
          ...state.validationErrors,
          ...newValidationErrors
        }
      }

    // Document action: set field error status
    case Types.SET_FIELD_ERROR_STATUS:
      const error = action.error || null
      const fieldName = action.field
      const {validationErrors} = state

      // If the validation error status for the field hasn't changed, there's nothing
      // to do here, so we return the current state (avoiding a re-render).
      // Note that the weak comparison (== instead of ===) is on purpose, as we want
      // `null` and `undefined` to evaluate the same way.
      if (validationErrors && validationErrors[fieldName] == error) {
        return state
      }

      return {
        ...state,
        local: {
          ...state.local,
          [fieldName]: action.value
        },
        validationErrors: {
          ...state.validationErrors,
          [fieldName]: error
        }
      }

    // Document action: set remote document
    case Types.SET_REMOTE_DOCUMENT:
      let {document, forceUpdate} = action

      // If there is already a document in the store with the same ID as the one
      // we're trying to add AND `forceUpdate` was set to false, we don't need
      // to update the store.
      if (!forceUpdate && state.remote && (state.remote._id === document._id)) {
        return state
      }

      let local = action.clearLocal ?
        {} : state.local || action.fromLocalStorage || {}

      return {
        ...state,
        fieldsNotPersistedInLocalStorage: action.fieldsNotPersistedInLocalStorage || [],
        loadedFromLocalStorage: Boolean(action.fromLocalStorage),
        local,
        remote: action.remote,
        remoteStatus: Constants.STATUS_IDLE,
        saveAttempts: 0
      }

    // Document action: set remote document status
    case Types.SET_REMOTE_DOCUMENT_STATUS:
      return {
        ...state,
        remoteStatus: action.status
      }

    // User action: user signed out
    case Types.SIGN_OUT:
      return initialState

    // Document action: start new document
    case Types.START_NEW_DOCUMENT:
      let loadedFromLocalStorage = Object.keys(action.document).length > 0

      return {
        ...state,
        fieldsNotPersistedInLocalStorage: [],
        loadedFromLocalStorage,
        local: action.document,
        remote: null,
        remoteStatus: Constants.STATUS_IDLE
      }

    // Document action: update local document
    case Types.UPDATE_LOCAL_DOCUMENT:
      let newFieldsNotPersistedInLocalStorage = state.fieldsNotPersistedInLocalStorage

      if (!action.persistInLocalStorage) {
        Object.keys(action.change).forEach(fieldName => {
          if (!newFieldsNotPersistedInLocalStorage.includes(fieldName)) {
            newFieldsNotPersistedInLocalStorage.push(fieldName)
          }
        })
      }

      const newState = {
        ...state,
        fieldsNotPersistedInLocalStorage: newFieldsNotPersistedInLocalStorage,
        local: {
          ...state.local,
          ...action.change
        }
      }

      return newState

    // Document action: user leaving document
    case Types.USER_LEAVING_DOCUMENT:
      return state

    default:
      return state
  }
}
