import * as types from './actionTypes'

export function setApi (api) {
  return {
    type: types.SET_API,
    api
  }
}

export function setApiList (apis) {
  return {
    type: types.SET_API_LIST,
    apis,
    status: 'fetchComplete'
  }
}

export function setApiFetchStatus (status) {
  return {
    type: types.SET_API_FETCH_STATUS,
    status
  }
}
