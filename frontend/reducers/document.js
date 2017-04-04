'use strict'

import * as Constants from 'lib/constants'
import * as LocalStorage from 'lib/local-storage'
import * as Types from 'actions/actionTypes'

const initialState = {
  dirty: false,
  loadedFromLocalStorage: false,
  local: null,
  peers: null,
  remote: null,
  remoteStatus: Constants.STATUS_IDLE,
  validationErrors: null
}

export default function document (state = initialState, action = {}) {
  switch (action.type) {

    // Document action: clear remote document
    case Types.CLEAR_REMOTE_DOCUMENT:
      return initialState

    // Document action: discard unsaved changes
    case Types.DISCARD_UNSAVED_CHANGES:
      LocalStorage.clearDocument(action.context)

      return {
        ...state,
        dirty: false,
        loadedFromLocalStorage: false,
        local: {},
        validationErrors: null
      }

    // Document action: user leaving document
    case Types.USER_LEAVING_DOCUMENT:
      if (Object.keys(state.local).length > 0) {
        LocalStorage.writeDocument(action.context, state.local)
      }

      return state

    // Document action: save document
    case Types.SAVE_DOCUMENT:
      LocalStorage.clearDocument(action.context)

      return {
        ...state,
        dirty: false
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
      // We start by trying to load the document with the given ID from local
      // storage.
      let draftDocument = LocalStorage.readDocument(action.context)
      let localDocument = draftDocument || {}

      return {
        ...state,
        dirty: Boolean(draftDocument),
        loadedFromLocalStorage: Boolean(draftDocument),
        local: localDocument,
        remote: action.document,
        remoteStatus: Constants.STATUS_IDLE
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
      const newDocument = LocalStorage.readDocument(action.context) || {}

      return {
        ...state,
        local: newDocument,
        remote: null,
        remoteStatus: Constants.STATUS_IDLE
      }

    // Document action: update local document
    case Types.UPDATE_LOCAL_DOCUMENT:
      const newState = {
        ...state,
        dirty: true,
        local: {
          ...state.local,
          ...action.change
        }
      }

      LocalStorage.writeDocument(action.context, newState.local)

      return newState

    default:
      return state
  }
}
