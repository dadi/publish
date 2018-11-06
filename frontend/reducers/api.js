'use strict'

import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import {Format} from 'lib/util/string'

export const initialState = {
  apis: [],
  currentApi: undefined,
  currentCollection: undefined,
  currentParentCollection: undefined,
  error: undefined,
  isLoading: false,
  remoteError: null
}

export default function api (state = initialState, action = {}) {
  switch (action.type) {

    // Action: set API list
    case Types.SET_API_LIST:
      let newState = {
        ...state,
        apis: action.apis,
        isLoading: false
      }
      let parameters = action.routeParameters

      // Adding `_publishLink` and `_publishMenu` properties to collections.
      addCollectionLinks(action.apis)

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
          undefined
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

function addCollectionLinks (apis) {
  // A hash object keeping a count for each menu item + collection name
  // pair. Whenever a count is greater than 1, it means a collection –
  // i.e. two collections with the same name either under the same menu
  // item or under no menu.
  let counts = {}

  // This method takes a menu item slug and a collection name. It adds
  // the pair to the `counts` hash map and returns a key for the pair,
  // as well as a suffix which is something like '-2', '-3' etc. if
  // there is a collision or an empty string otherwise.
  let getKeyAndSuffix = (collectionName, menuSlug) => {
    let key = menuSlug ? `${menuSlug}/${collectionName}` : collectionName

    counts[key] = counts[key] || 0
    counts[key]++

    return {
      key,
      suffix: (counts[key] > 1) ? `-${counts[key]}` : ''
    }
  }

  apis.filter(api => {
    return Boolean(api.collections && api.collections.length)
  }).forEach(api => {
    // There are some collections that we don't want to display on the menu,
    // like auth or media collections.
    let filteredCollections = api.collections.filter(collection => {
      let isMediaCollection = collection.settings &&
        collection.settings.type === 'media'

      return !isMediaCollection
    })
    let {menu = []} = api

    // We start by adding all the collections that are referenced in the menu
    // object.
    menu.forEach(menuItem => {
      // If this is a menu item with nested collections, we'll process each of
      // them individually.
      if (menuItem.title && menuItem.collections) {
        let menuSlug = Format.slugify(menuItem.title)

        menuItem.collections.forEach(collectionName => {
          let collection = api.collections.find(item => {
            return item.slug === collectionName
          })

          if (!collection) return

          let {key, suffix} = getKeyAndSuffix(collectionName, menuSlug)

          collection._publishLink = `/${key}${suffix}`
          collection._publishMenu = menuItem.title
        })
      } else if (typeof menuItem === 'string') {
        // This is a top-level collection, so `menuItem` is the name of the
        // a collection.
        let collection = api.collections.find(item => {
          return item.slug === menuItem
        })

        if (!collection) return

        let {key, suffix} = getKeyAndSuffix(menuItem)

        collection._publishLink = `/${key}${suffix}`
        collection._publishMenu = null
      }
    })

    // Then we loop through all collections in the API and process any that
    // are missing from the menu object.
    filteredCollections.forEach(collection => {
      // The collection has already been processed, nothing to do here.
      if (collection._publishLink) {
        return
      }

      let {key, suffix} = getKeyAndSuffix(collection.slug)

      collection._publishLink = `/${key}${suffix}`
      collection._publishMenu = null
    })
  })
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
  if (!urlCollection) return

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

      matchesFound++

      // If there isn't a group in the URL and the candidate collection isn't
      // inside a group, then it's a match.
      if (!urlGroup && !group) {
        return matchesFound === urlCollectionNumber
      }

      // If there is a group in the URL and that matches the group of the candidate
      // collection, then it's a match.
      if (urlGroup && group && (Format.slugify(group.title) === urlGroup)) {
        return matchesFound === urlCollectionNumber
      }
    }
  })

  return api || (apis.length > 0 ? null : undefined)
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
  if (!api || !api.collections) return api

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
        collectionMatch = Constants.MEDIA_COLLECTION_SCHEMA
      } else {
        collectionMatch = api.collections.find(collection => {
          return collection.slug === referencedCollection
        })
      }
    }
  }

  return collectionMatch || null
}
