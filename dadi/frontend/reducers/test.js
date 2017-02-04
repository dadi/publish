import * as types from '../actions/actionTypes'

const initialState = {
  testing: false
}

export default function test(state = initialState, action = {}) {
  switch (action.type) {
    case types.TEST_ACTION:
      return {
        ...state,
        testing: true
      }

    default:
      return state
  }
}
