import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const DEFAULT_ERROR_MESSAGE = 'Unknown error'

const blankDataBucket = {
  //fieldsNotPersistedInLocalStorage: [],
  //hasBeenValidated: false,
  dirty: false,
  isDeleted: false,
  isDeleting: false,
  isLoading: false,
  isSaving: false,
  lastSaveMode: null,
  local: null,
  //localMeta: null,
  remote: null,
  remoteError: null,
  saveAttempts: 0,
  timestamp: 0,
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
          lastSaveMode: action.mode,
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
          isLoading: false,
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

    case Types.UPDATE_LOCAL_DOCUMENT:
      const errorUpdate = Object.keys(action.update).reduce((errors, field) => {
        errors[field] = action.error[field]

        return errors
      }, {})

      console.log('---------->', action)

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

// function _document (state = initialState, action = {}) {
//   switch (action.type) {
//     case Types.ATTEMPT_SAVE_DOCUMENT:
//       return {
//         ...state,
//         saveAttempts: state.saveAttempts + 1
//       }

//     case Types.AUTHENTICATE:
//       return initialState

//     case Types.CLEAR_REMOTE_DOCUMENT:
//       return initialState

//     case Types.DISCARD_UNSAVED_CHANGES:
//       return {
//         ...state,
//         hasLoadedFromLocalStorage: false,
//         local: {},
//         localMeta: {},
//         validationErrors: null
//       }

//     case Types.DELETE_DOCUMENTS:
//       if (state.remote && action.ids.includes(state.remote._id)) {
//         return initialState
//       }

//       return state

//     case Types.SET_DOCUMENT_PEERS:
//       return {
//         ...state,
//         peers: action.peers
//       }

//     case Types.SET_ERRORS_FROM_REMOTE_API:
//       let newValidationErrors = {}

//       action.errors.forEach(error => {
//         newValidationErrors[error.field] = error.message || true
//       })

//       return {
//         ...state,
//         hasBeenValidated: true,
//         validationErrors: {
//           ...state.validationErrors,
//           ...newValidationErrors
//         }
//       }

//     case Types.SET_FIELD_ERROR_STATUS:
//       const error = action.error || null
//       const fieldName = action.field
//       const {validationErrors} = state

//       // If the validation error status for the field hasn't changed, there's nothing
//       // to do here, so we return the current state (avoiding a re-render).
//       // Note that the weak comparison (== instead of ===) is on purpose, as we want
//       // `null` and `undefined` to evaluate the same way.
//       if (validationErrors && validationErrors[fieldName] == error) {
//         return state
//       }

//       return {
//         ...state,
//         local: {
//           ...state.local,
//           [fieldName]: action.value
//         },
//         validationErrors: {
//           ...state.validationErrors,
//           [fieldName]: error
//         }
//       }

//     case Types.SET_REMOTE_DOCUMENT:
//       let {document, forceUpdate} = action

//       // If there is already a document in the store with the same ID as the one
//       // we're trying to add AND `forceUpdate` was set to false, we don't need
//       // to update the store.
//       if (!forceUpdate && state.remote && (state.remote._id === document._id)) {
//         return state
//       }

//       let local = {}

//       if (!action.clearLocal) {
//         // We can reuse the contents of state.local if the document being edited
//         // is the same.
//         let shouldReuseExistingLocal =
//           (state.remote && state.remote._id) === (action.remote && action.remote._id)

//         local = (shouldReuseExistingLocal && state.local) ||
//           action.fromLocalStorage ||
//           {}
//       }

//       return {
//         ...state,
//         fieldsNotPersistedInLocalStorage: action.fieldsNotPersistedInLocalStorage || [],
//         hasLoadedFromLocalStorage: Boolean(action.fromLocalStorage),
//         isLoading: false,
//         isSaving: false,
//         local,
//         localMeta: {},
//         remote: action.remote,
//         saveAttempts: 0
//       }

//     case Types.SET_REMOTE_DOCUMENT_STATUS:
//       switch (action.status) {

//         // Document is idle.
//         case Constants.STATUS_IDLE:
//           return {
//             ...state,
//             isLoading: false,
//             isSaving: false
//           }

//         // Document is fetching.
//         case Constants.STATUS_LOADING:
//           return {
//             ...state,
//             isLoading: true
//           }

//         // Fetch or save have failed.
//         case Constants.STATUS_FAILED:
//           return {
//             ...state,
//             isLoading: false,
//             isSaving: false,
//             remoteError: action.data || 500
//           }

//         // Document is saving.
//         case Constants.STATUS_SAVING:
//           return {
//             ...state,
//             isSaving: true
//           }
//       }

//       return state

//     // User action: user signed out
//     case Types.SIGN_OUT:
//       return initialState

//     // Document action: start new document
//     case Types.START_NEW_DOCUMENT:
//       let hasLoadedFromLocalStorage = Object.keys(action.document).length > 0

//       return {
//         ...state,
//         collection: action.collection,
//         fieldsNotPersistedInLocalStorage: [],
//         hasLoadedFromLocalStorage,
//         isLoading: false,
//         local: action.document,
//         localMeta: {},
//         remote: null
//       }

//     // Document action: update local document
//     case Types.UPDATE_LOCAL_DOCUMENT:
//       let newFieldsNotPersistedInLocalStorage = state.fieldsNotPersistedInLocalStorage

//       if (!action.persistInLocalStorage) {
//         Object.keys(action.update).forEach(fieldName => {
//           if (!newFieldsNotPersistedInLocalStorage.includes(fieldName)) {
//             newFieldsNotPersistedInLocalStorage.push(fieldName)
//           }
//         })
//       }

//       const newState = {
//         ...state,
//         fieldsNotPersistedInLocalStorage: newFieldsNotPersistedInLocalStorage,
//         hasBeenValidated: true,
//         local: {
//           ...state.local,
//           ...action.update
//         },
//         localMeta: Object.assign({}, action.meta)
//       }

//       return newState

//     default:
//       return state
//   }
// }
