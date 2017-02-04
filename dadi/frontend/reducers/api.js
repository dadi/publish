import * as types from '../actions/actionTypes'

const initialState = {
  apis: []
}

export default function api(state = initialState, action = {}) {
  console.log('action!', action.type, action)
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
