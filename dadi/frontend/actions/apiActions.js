import * as Types from 'actions/actionTypes'

export function setApi(api) {
  return {
    type: Types.SET_API,
    api
  }
}

export function setApiList(apis) {
  return {
    type: Types.SET_API_LIST,
    apis,
    status: 'fetchComplete'
  }
}

export function setApiFetchStatus(status) {
  return {
    type: Types.SET_API_FETCH_STATUS,
    status
  }
}

export function setCurrentCollection(collectionName) {
  return {
    type: Types.SET_API_CURRENT_COLLECTION,
    collectionName
  }
}
