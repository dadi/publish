import * as types from './actionTypes'

export function setApiList (apis) {
  return {
    type: types.SET_API_LIST,
    apis
  }
}
