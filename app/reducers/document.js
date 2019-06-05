import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const DEFAULT_ERROR_MESSAGE = 'Unknown error'

const blankDataBucket = {
  dirty: false,
  hasBeenValidated: false,
  isDeleted: false,
  isDeleting: false,
  isLoading: false,
  isSaving: false,
  lastSaveMode: null,
  local: null,
  remote: null,
  remoteError: null,
  saveAttempts: 0,
  saveCallbacks: {},
  timestamp: 0,
  validationCallbacks: {},
  validationErrors: null,
  wasLoadedFromLocalStorage: false,
}

const initialState = {}

export default function document (state = initialState, action = {}) {
  switch (action.type) {
    case Types.ATTEMPT_SAVE_DOCUMENT:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          lastSaveMode: action.mode || null,
          saveAttempts: state[action.key]
            ? state[action.key].saveAttempts + 1
            : 1
        }
      }

    case Types.DELETE_DOCUMENTS_FAILURE:
      if (!state[action.key]) return state

      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          isDeleting: false,
          remoteError: action.data || DEFAULT_ERROR_MESSAGE
        }
      }

    case Types.DELETE_DOCUMENTS_START:
      if (!state[action.key]) return state

      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          isDeleting: true
        }
      }

    case Types.DELETE_DOCUMENTS_SUCCESS:
      if (!state[action.key]) return state

      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          isDeleted: true
        }
      }
    
    case Types.DISCARD_UNSAVED_CHANGES:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          local: {},
          validationErrors: null,
          wasLoadedFromLocalStorage: false  
        }
      }

    case Types.LOAD_DOCUMENT_FAILURE:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          remoteError: action.data || DEFAULT_ERROR_MESSAGE
        }
      }

    case Types.LOAD_DOCUMENT_START:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          isLoading: true
        }
      }
    
    case Types.LOAD_DOCUMENT_SUCCESS:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          isLoading: false,
          isSaving: false,
          local: action.fromLocalStorage || {},
          remote: action.document,
          remoteError: null,
          timestamp: action.timestamp,
          wasLoadedFromLocalStorage: Boolean(action.fromLocalStorage)
        }
      }

    case Types.REGISTER_SAVE_CALLBACK:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          saveCallbacks: {
            ...(state[action.key] && state[action.key].saveCallbacks),
            [action.fieldName]: action.callback
          }
        }
      }

    case Types.REGISTER_VALIDATION_CALLBACK:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          validationCallbacks: {
            ...(state[action.key] && state[action.key].validationCallbacks),
            [action.fieldName]: action.callback
          }
        }
      }

    case Types.SAVE_DOCUMENT_FAILURE:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          isSaving: false,
          remoteError: action.data || DEFAULT_ERROR_MESSAGE
        }
      }

    case Types.SAVE_DOCUMENT_START:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          isSaving: true
        }
      }

    case Types.SAVE_DOCUMENT_SUCCESS:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          isSaving: false,
          local: {},
          remote: action.data,
          remoteError: null,
          validationErrors: null
        }
      }

    case Types.START_NEW_DOCUMENT:
      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          local: action.fromLocalStorage || {},
          wasLoadedFromLocalStorage: Boolean(action.fromLocalStorage)
        }
      }

    case Types.UPDATE_LOCAL_DOCUMENT:
      const errorUpdate = Object.keys(action.update).reduce((errors, field) => {
        errors[field] = action.error[field]

        return errors
      }, {})

      return {
        ...state,
        [action.key]: {
          ...state[action.key] || blankDataBucket,
          hasBeenValidated: true,
          local: {
            ...(state[action.key] && state[action.key].local),
            ...action.update
          },        
          validationErrors: {
            ...(state[action.key] && state[action.key].validationErrors),
            ...errorUpdate
          }
        }
      }

    default:
      return state
  }
}
