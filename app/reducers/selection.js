import * as Types from 'actions/actionTypes'

const initialState = {}

export default function selection(state = initialState, action = {}) {
  switch (action.type) {
    case Types.SET_DOCUMENT_SELECTION:
      return {
        ...state,
        [action.key]: action.selectedDocuments
      }

    default:
      return state
  }
}
