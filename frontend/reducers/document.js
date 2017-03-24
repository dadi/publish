'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const initialState = {
  local: null,
  remote: null,
  remoteStatus: Constants.STATUS_IDLE,
  validationErrors: {}
}

export default function document (state = initialState, action = {}) {
  switch (action.type) {

    // Action: set remote document
    case Types.SET_REMOTE_DOCUMENT:
      return {
        ...state,
        local: Object.assign({}, action.document),
        remote: action.document,
        remoteStatus: Constants.STATUS_IDLE
      }

    // Action: clear remote document
    case Types.CLEAR_REMOTE_DOCUMENT:
      return initialState

    // Action: set remote document status
    case Types.SET_REMOTE_DOCUMENT_STATUS:
      return {
        ...state,
        remoteStatus: action.status
      }

    // Action: set field error status
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

    // Action: set errors from remote API
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

    // Action: set field error status
    case Types.UPDATE_LOCAL_DOCUMENT:
      return {
        ...state,
        local: {
          ...state.local,
          ...action.data
        }
      }

    // Action: start new document
    case Types.START_NEW_DOCUMENT:
      return {
        ...state,
        local: {},
        remote: null,
        remoteStatus: Constants.STATUS_IDLE
      }

    // Action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}
