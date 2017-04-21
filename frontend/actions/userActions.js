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

    apiBridgeClient({
      api: authApi,
      collection: authCollection
    }).whereFieldIsEqualTo('_id', currentUser._id)
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

    const apiBridge = apiBridgeClient({
      api,
      collection
    }).whereFieldIsEqualTo('_id', currentUser._id)
      .whereFieldIsEqualTo('email', currentUser.email)

    apiBridge.update(user).then(response => {
      if (response.results && response.results.length) {
        const newUser = response.results[0]

        dispatch(documentActions.setRemoteDocument(newUser, {
          clearLocal: true
        }))
        dispatch(setRemoteUser(newUser))
      } else {
        dispatch(documentActions.setRemoteDocumentStatus(Constants.STATUS_FAILED))
      }
    }).catch(errors => {
      const passwordField = Object.keys(collection.fields).find(fieldName => {
        return collection.fields[fieldName].publish &&
          collection.fields[fieldName].publish.subType === 'Password'
      })

      if (!passwordField) return

      let validationErrors = getState().document.validationErrors[passwordField] || []

      if (errors instanceof Array) {
        errors.forEach(error => {
          if (error.details && error.details.includes('\'WRONG_PASSWORD\'')) {
            validationErrors.push(Constants.ERROR_WRONG_PASSWORD)
          }
        })

        dispatch(documentActions.setFieldErrorStatus(
          passwordField,
          null,
          validationErrors
        ))
      }
    })
  }
}

export function signOut () {
  return {
    type: Types.SIGN_OUT
  }
}
