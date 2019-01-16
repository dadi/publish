'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const initialState = {
  collection: {},
  fieldsNotPersistedInLocalStorage: [],
  hasBeenValidated: false,
  hasLoadedFromLocalStorage: false,
  isLoading: false,
  isSaving: false,
  local: null,
  localMeta: null,
  peers: null,
  remote: null,
  remoteError: null,
  saveAttempts: 0,
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

    // Resetting state when user authenticates.
    case Types.AUTHENTICATE:
      return initialState

    // Document action: clear remote document
    case Types.CLEAR_REMOTE_DOCUMENT:
      return initialState

    // Document action: discard unsaved changes
    case Types.DISCARD_UNSAVED_CHANGES:
      return {
        ...state,
        hasLoadedFromLocalStorage: false,
        local: {},
        localMeta: {},
        validationErrors: null
      }

    // Documents action: delete documents
    case Types.DELETE_DOCUMENTS:
      if (state.remote && action.ids.includes(state.remote._id)) {
        return initialState
      }

      return state

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
        hasBeenValidated: true,
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

      let local = {}

      if (!action.clearLocal) {
        // We can reuse the contents of state.local if the document being edited
        // is the same.
        let shouldReuseExistingLocal =
          (state.remote && state.remote._id) === (action.remote && action.remote._id)

        local = (shouldReuseExistingLocal && state.local) ||
          action.fromLocalStorage ||
          {}
      }

      return {
        ...state,
        fieldsNotPersistedInLocalStorage: action.fieldsNotPersistedInLocalStorage || [],
        hasLoadedFromLocalStorage: Boolean(action.fromLocalStorage),
        isLoading: false,
        isSaving: false,
        local,
        localMeta: {},
        remote: action.remote,
        saveAttempts: 0
      }

    // Document action: set remote document status
    case Types.SET_REMOTE_DOCUMENT_STATUS:
      switch (action.status) {

        // Document is idle.
        case Constants.STATUS_IDLE:
          return {
            ...state,
            isLoading: false,
            isSaving: false
          }

        // Document is fetching.
        case Constants.STATUS_LOADING:
          return {
            ...state,
            isLoading: true
          }

        // Fetch or save have failed.
        case Constants.STATUS_FAILED:
          return {
            ...state,
            isLoading: false,
            isSaving: false,
            remoteError: action.data || 500
          }

        // Document is saving.
        case Constants.STATUS_SAVING:
          return {
            ...state,
            isSaving: true
          }
      }

      return state

    // User action: user signed out
    case Types.SIGN_OUT:
      return initialState

    // Document action: start new document
    case Types.START_NEW_DOCUMENT:
      let hasLoadedFromLocalStorage = Object.keys(action.document).length > 0

      return {
        ...state,
        collection: action.collection,
        fieldsNotPersistedInLocalStorage: [],
        hasLoadedFromLocalStorage,
        isLoading: false,
        local: action.document,
        localMeta: {},
        remote: null
      }

    // Document action: update local document
    case Types.UPDATE_LOCAL_DOCUMENT:
      let newFieldsNotPersistedInLocalStorage = state.fieldsNotPersistedInLocalStorage

      if (!action.persistInLocalStorage) {
        Object.keys(action.update).forEach(fieldName => {
          if (!newFieldsNotPersistedInLocalStorage.includes(fieldName)) {
            newFieldsNotPersistedInLocalStorage.push(fieldName)
          }
        })
      }

      const newState = {
        ...state,
        fieldsNotPersistedInLocalStorage: newFieldsNotPersistedInLocalStorage,
        hasBeenValidated: true,
        local: {
          ...state.local,
          ...action.update
        },
        localMeta: Object.assign({}, action.meta)
      }

      return newState

    default:
      return state
  }
}
