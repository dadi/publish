import * as Types from 'actions/actionTypes'

export function setApi(api) {
  return {
    api,
    type: Types.SET_API,
  }
}

export function setApiStatus(status) {
  return {
    status,
    type: Types.SET_API_STATUS
  }
}

export function setCurrentCollection(collectionName) {
  return {
    collectionName,
    type: Types.SET_API_CURRENT_COLLECTION
  }
}
