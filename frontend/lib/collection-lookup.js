'use strict'

import {slugify} from 'lib/util'

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
export function getApiForUrlParams (apis, filter) {
  const urlCollection = filter.collection
  const urlGroup = filter.group

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
 * @param {string} field - The name of the field containing a referenced
 *                         document being edited.
 *
 * @return {object} The schema for the given collection.
 */
export function getCollectionForUrlParams (apis, {
  collection,
  group,
  useApi,
  referencedField
}) {
  const api = useApi || getApiForUrlParams(apis, {collection, group})

  if (!api || !api.collections) return null

  const collectionParts = collection.match(/(.*)-([0-9]+)/)
  const collectionName = collectionParts ? collectionParts[1] : collection

  let collectionMatch = api.collections.find(collection => {
    return collection.name === collectionName
  })

  // If we have a referenced referencedField with a valid referenced collection,
  // we need to return the schema of that collection instead.
  if (referencedField) {
    const fieldSchema = collectionMatch.fields[referencedField]
    const referencedCollection = fieldSchema &&
      fieldSchema.settings &&
      fieldSchema.settings.collection

    if (referencedCollection) {
      collectionMatch = api.collections.find(collection => {
        return collection.name === referencedCollection
      })
    }
  }

  return collectionMatch
}

export function getAuthCollection (apis, auth) {
  const api = apis.find(api => api.host === auth.host && api.port === auth.port)

  if (!api || !api.collections) return null

  const collection = api.collections.find(collection => collection.name === auth.collection)

  return collection
}