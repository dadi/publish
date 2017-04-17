import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import * as documentActions from './documentActions'

import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'
import apiBridgeClient from 'lib/api-bridge-client'

export function setRemoteUser (user) {
  return {
    type: Types.SET_REMOTE_USER,
    user
  }
}

export function updateLocalUser () {
  return (dispatch, getState) => {
    const apis = getState().api.apis
    const currentUser = getState().user.remote
    const authApi = getApiForUrlParams(apis, {
      collection: Constants.AUTH_COLLECTION
    })
    const authCollection = getCollectionForUrlParams(apis, {
      collection: Constants.AUTH_COLLECTION,
      useApi: authApi
    })

    apiBridgeClient(authApi)
      .in(authCollection.name)
      .whereFieldIsEqualTo('_id', currentUser._id)
      .find()
      .then(response => {
        if (response.results && response.results.length) {
          dispatch(setRemoteUser(response.results[0]))
        }
      })
  }
}

export function saveUser ({api, collection, user}) {
  return (dispatch, getState) => {
    const currentUser = getState().user.remote

    dispatch(documentActions.setRemoteDocumentStatus(Constants.STATUS_SAVING))

    apiBridgeClient(api)
      .in(collection.name)
      .whereFieldIsEqualTo('_id', currentUser._id)
      .update(user)
      .then(response => {
        if (response.results && response.results.length) {
          const newUser = response.results[0]

          dispatch(documentActions.setRemoteDocument(newUser, true, true))
          dispatch(setRemoteUser(newUser))
        } else {
          dispatch(documentActions.setRemoteDocumentStatus(Constants.STATUS_FAILED))
        }
      })
  }
}

export function setUserStatus (status) {
  return {
    status,
    type: Types.SET_USER_STATUS
  }
}

export function signOut () {
  return {
    type: Types.SIGN_OUT
  }
}
