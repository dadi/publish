import * as Types from 'actions/actionTypes'

export function setApi(api) {
  return {
    type: Types.SET_API,
    api
  }
}

export function setApiStatus(status) {
  return {
    type: Types.SET_API_STATUS,
    status
  }
}

export function setCurrentCollection(collectionName) {
  return {
    type: Types.SET_API_CURRENT_COLLECTION,
    collectionName
  }
}
