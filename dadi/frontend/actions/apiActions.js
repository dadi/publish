import * as types from './actionTypes'

export function setApiList (apis) {
  return {
    type: types.SET_API_LIST,
    apis
  }
}

export function setApiFetchStatus (status) {
  console.log("STATUS", status)
  return {
    type: types.SET_API_FETCH_STATUS,
    status
  }
}

