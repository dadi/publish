import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const blankDataBucket = {
  dirty: false,
  error: null,
  isDeleting: 0,
  isLoading: false,
  metadata: null,
  results: null,
  timestamp: 0
}

const initialState = {}

export default function apiData(state = initialState, action = {}) {
  switch (action.type) {
    case Types.DELETE_DOCUMENTS_FAILURE:
      if (!state[action.key]) return state

      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          error: action.data,
          isDeleting: 0
        }
      }

    case Types.DELETE_DOCUMENTS_START:
      if (!state[action.key]) return state

      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          isDeleting: action.ids.length
        }
      }

    case Types.DELETE_DOCUMENTS_SUCCESS: {
      const {slug: collection} = action.collection

      const newState = {...state}

      // We must go through all the keys in the store and flag as dirty all
      // the document lists for the collection which we've just deleted a
      // document from.
      Object.keys(newState).forEach(key => {
        if (key.includes(`"collection":"${collection}"`)) {
          newState[key] = {
            ...newState[key],
            dirty: true
          }
        }
      })

      return {
        ...newState,
        [action.key]: {
          ...newState[action.key],
          dirty: true,
          isDeleting: 0
        }
      }
    }

    case Types.SET_DOCUMENT_LIST:
      return {
        ...state,
        [action.key]: {
          ...(state[action.key] || blankDataBucket),
          error: null,
          dirty: false,
          isLoading: false,
          metadata: action.metadata,
          results: action.results,
          timestamp: action.timestamp
        }
      }

    case Types.SET_DOCUMENT_LIST_STATUS: {
      const setDocumentListStatusData = {}

      switch (action.status) {
        case Constants.STATUS_LOADING:
        case Constants.STATUS_SAVING:
          setDocumentListStatusData.isLoading = true

          break

        case Constants.STATUS_FAILED:
          setDocumentListStatusData.dirty = false
          setDocumentListStatusData.error = action.data || true
          setDocumentListStatusData.isLoading = false

          break
      }

      return {
        ...state,
        [action.key]: {
          ...(state[action.key] || blankDataBucket),
          ...setDocumentListStatusData
        }
      }
    }

    case Types.TOUCH_DOCUMENT_LIST:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          dirty: true
        }
      }

    case Types.UPLOAD_MEDIA_FAILURE:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          error: action.data,
          isLoading: false
        }
      }

    case Types.UPLOAD_MEDIA_START:
      return {
        ...state,
        [action.key]: {
          ...(state[action.key] || blankDataBucket),
          isLoading: true
        }
      }

    case Types.UPLOAD_MEDIA_SUCCESS:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          dirty: true,
          isLoading: false
        }
      }

    default:
      return state
  }
}
