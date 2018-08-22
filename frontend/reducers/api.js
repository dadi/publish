'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import {Format} from 'lib/util/string'

export const initialState = {
  apis: [],
  currentApi: null,
  currentCollection: null,
  currentParentCollection: null,
  error: undefined,
  isLoading: false,
  paths: window.__documentRoutes__,
  remoteError: null
}

export default function api (state = initialState, action = {}) {
  switch (action.type) {

    // App action: authenticate
    case Types.AUTHENTICATE:
      return {
        ...state,
        paths: action.routes
      }

    // Action: set API list
    case Types.SET_API_LIST:
      let newState = {
        ...state,
        apis: action.apis,
        isLoading: false
      }
      let parameters = action.routeParameters

      if (parameters) {
        newState.currentApi = getApiForParameters({
          apis: action.apis,
          collection: parameters.collection,
          group: parameters.group
        })

        newState.currentCollection = getCollectionForParameters({
          api: newState.currentApi,
          collection: parameters.collection,
          group: parameters.group,
          referencedField: parameters.referencedField
        })

        newState.currentParentCollection = parameters.referencedField ?
          getCollectionForParameters({
            api: newState.currentApi,
            collection: parameters.collection,
            group: parameters.group
          }) :
          null
      }

      return newState

    // Action: Set status of API
    case Types.SET_API_STATUS:
      if (action.error === Constants.API_UNAUTHORISED_ERROR) {
        return initialState
      }

      switch (action.status) {
        case Constants.STATUS_LOADING:
        case Constants.STATUS_SAVING:
          return {
            ...state,
            isLoading: true
          }

        // Fetch or save have failed.
        case Constants.STATUS_FAILED:
          return {
            ...state,
            isLoading: false,
            remoteError: action.data || 500
          }
      }

      return state

    case Types.SET_ROUTE_PARAMETERS:
      if (!action.parameters.collection) {
        return state
      }

      let currentApi = getApiForParameters({
        apis: state.apis,
        collection: action.parameters.collection,
        group: action.parameters.group
      })
      let currentCollection = getCollectionForParameters({
        api: currentApi,
        collection: action.parameters.collection,
        group: action.parameters.group,
        referencedField: action.parameters.referencedField,
      })
      let currentParentCollection = action.parameters.referencedField ?
        getCollectionForParameters({
          api: currentApi,
          collection: action.parameters.collection,
          group: action.parameters.group
        }) :
        null

      return {
        ...state,
        currentApi,
        currentCollection,
        currentParentCollection
      }

    // Action: user signed out
    case Types.SIGN_OUT:
      return initialState

    default:
      return state
  }
}

/**
 * Returns the API to be used given a group and collection name
 * present in the URL.
 *
 * @param {array} params.apis - The list of available APIs.
 * @param {string} params.collection - The name of the collection present
 *   in the URL.
 * @param {string} params.group - The group present in the URL.
 *
 * @return {object} The configuration block for the given API.
 */
function getApiForParameters ({
  apis,
  collection: urlCollection,
  group: urlGroup
}) {
  if (!urlCollection) return null

  // Are we looking at a collection name with a prefix (e.g. 'users-2')?
  let urlCollectionParts = urlCollection.match(/(.*)-([0-9]+)/)
  let urlCollectionName = urlCollectionParts ? urlCollectionParts[1] : urlCollection
  let urlCollectionNumber = urlCollectionParts ? parseInt(urlCollectionParts[2]) : 1

  let matchesFound = 0

  let api = apis.find(api => {
    let collection = api.collections && api.collections.find(collection => {
      return collection.slug === urlCollectionName
    })

    if (collection) {
      let group = (api.menu || []).find(menuItem => {
        return menuItem.collections && menuItem.collections.includes(urlCollectionName)
      })

      // If there isn't a group in the URL and the candidate collection isn't
      // inside a group, then it's a match.
      if (!urlGroup && !group) {
        return (++matchesFound === urlCollectionNumber)
      }

      // If there is a group in the URL and that matches the group of the candidate
      // collection, then it's a match.
      if (urlGroup && group && (Format.slugify(group.title) === urlGroup)) {
        return (++matchesFound === urlCollectionNumber)
      }
    }
  })

  return api
}

/**
 * Returns the collection to be used given a group and collection name
 * present in the URL.
 *
 * @param {array} api - The current API.
 * @param {string} filter.collection - The name of the collectiuon present in
 *   the URL.
 * @param {string} filter.group - The name of the group present in the URL.
 * @param {string} filter.referencedField - The name of a referenced field being
 *   edited.
 *
 * @return {object} The schema for the given collection.
 */
function getCollectionForParameters ({
  api,
  collection,
  group,
  referencedField
}) {
  if (!api || !api.collections) return null

  let collectionMatch

  // Are we after the auth collection?
  if (collection === Constants.AUTH_COLLECTION) {
    collectionMatch = api.collections.find(collection => collection._isAuthCollection)
  } else {
    const collectionParts = collection.match(/(.*)-([0-9]+)/)
    const collectionName = collectionParts ? collectionParts[1] : collection

    collectionMatch = api.collections.find(collection => {
      return collection.slug === collectionName
    })
  }

  // If we have a referenced referencedField with a valid referenced collection,
  // we need to return the schema of that collection instead.
  if (referencedField) {
    const fieldSchema = collectionMatch.fields[referencedField]
    const referencedCollection = fieldSchema &&
      fieldSchema.settings &&
      fieldSchema.settings.collection

    if (referencedCollection) {
      // Is this field referencing a media collection?
      if (referencedCollection === Constants.MEDIA_COLLECTION) {
        collectionMatch = Constants.MEDIA_COLLECTION
      } else {
        collectionMatch = api.collections.find(collection => {
          return collection.slug === referencedCollection
        })
      }
    }
  }

  return collectionMatch
}
