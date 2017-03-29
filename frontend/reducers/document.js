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
  validationErrors: {}
}

// Boolean fields are a bit special. Any required field that hasn't
// been touched by the user in the UI should generate a validation error,
// except for Boolean fields, as these don't have a "neutral" state.
// You can start editing a document and see a Boolean field set to
// "false" and that may be exactly how you want it, but at that point the
// field doesn't exist in the document store yet because there wasn't a
// change event. To get around this, when we create our local copy of
// the document we check for any Boolean fields in the collection
// that aren't in the document object and set those to `false`.
function getDocumentWithBooleans (document, collectionSchema) {
  const booleanFields = Object.keys(collectionSchema.fields).filter(field => {
    return collectionSchema.fields[field].type === 'Boolean'
  })

  let newDocument = Object.assign({}, document)

  booleanFields.forEach(booleanField => {
    if (typeof newDocument[booleanField] === 'undefined') {
      newDocument[booleanField] = false
    }
  })

  return newDocument
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
        local: getDocumentWithBooleans(state.remote, action.context.collection),
        validationErrors: {}
      }

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

      // If the validation error status for the field hasn't changed, there's nothing
      // to do here, so we return the current state (avoiding a re-render).
      // Note that the weak comparison (== instead of ===) is on purpose, as we want
      // `null` and `undefined` to evaluate the same way.
      if (state.validationErrors[fieldName] == error) {
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
      let localDocument = draftDocument
        || getDocumentWithBooleans(action.document, action.context.collection)

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
      return {
        ...state,
        local: {},
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
