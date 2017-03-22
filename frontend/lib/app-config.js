'use strict'

import 'fetch'
import {slugify} from 'lib/util'

/**
 * Retrieves the app configuration file.
 *
 * @return {promise} An object representing the configuration file.
 */
export function getAppConfig () {
  return fetch('/config', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
}

/**
 * Returns the API to be used given a group and collection name
 * present in the URL.
 *
 * @param {array} apis - The list of available APIs.
 * @param {string} urlGroup - The group present in the URL.
 * @param {string} urlCollection - The name of the collection present
 *                                 in the URL.
 *
 * @return {object} The configuration block for the given API.
 */
export function getCurrentApi (apis, urlGroup, urlCollection) {
  // Are we looking at a collection name with a prefix (e.g. 'users-2')?
  const urlCollectionParts = urlCollection.match(/(.*)-([0-9]+)/)
  const urlCollectionName = urlCollectionParts ? urlCollectionParts[1] : urlCollection
  const urlCollectionNumber = urlCollectionParts ? parseInt(urlCollectionParts[2]) : 1

  let matchesFound = 0

  const api = apis.find(api => {
    const collection = api.collections && api.collections.find(collection => {
      return collection.name === urlCollectionName
    })

    if (collection) {
      const group = (api.menu || []).find(menuItem => {
        return menuItem.collections && menuItem.collections.includes(urlCollectionName)
      })

      // If there isn't a group in the URL and the candidate collection isn't
      // inside a group, then it's a match.
      if (!urlGroup && !group) {
        return (++matchesFound === urlCollectionNumber)
      }

      // If there is a group in the URL and that matches the group of the candidate
      // collection, then it's a match.
      if (urlGroup && group && (slugify(group.title) === urlGroup)) {
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
 * @param {array} apis - The list of available APIs.
 * @param {string} urlGroup - The group present in the URL.
 * @param {string} urlCollection - The name of the collection present
 *                                 in the URL.
 *
 * @return {object} The schema for the given collection.
 */
export function getCurrentCollection (apis, urlGroup, urlCollection) {
  const api = getCurrentApi(apis, urlGroup, urlCollection)

  if (!api || !api.collections) return null

  const urlCollectionParts = urlCollection.match(/(.*)-([0-9]+)/)
  const urlCollectionName = urlCollectionParts ? urlCollectionParts[1] : urlCollection

  const collection = api.collections.find(collection => {
    return collection.name === urlCollectionName
  })

  return collection
}

export function getAuthCollection(apis, auth) {
  const api = apis.find(api => api.host === auth.host && api.port === auth.port)

  if (!api || !api.collections) return null

  const collection = api.collections.find(collection => collection.name === auth.collection)

  return collection
}
