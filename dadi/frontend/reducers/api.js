import * as types from '../actions/actionTypes'

const initialState = {
  apis: config.apis
}

export default function api(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_API_LIST:
      return {
        ...state,
        apis: action.apis
      }
    default:
      return state
  }
}
