'use strict'

export function buildCollectionUrls (collections) {
  collections.map(collection => {
    const parts = getFieldCollections(collections, collection, collection.slug, [collection.slug])

    console.log('parts', parts)
  })
}

export function getFieldCollections (collections, collection, previous, parts) {
  const fields = filterReferenceFields(collection)

  if (!fields.length) return parts

  const referenceInstances = fields.map(field => {
    if (field.settings.collection === 'mediaStore') return [`${previous}.mediaCollection`]
    const subCollection = getCollectionBySlug(collections, field.settings.collection)
    const previousSlug = `${previous}.${field.settings.collection}`

    return getFieldCollections(collections, subCollection, previousSlug, [previousSlug])
  })

  referenceInstances
    .filter(Boolean)
    .map(instance => {
      parts = parts.concat(instance)
    })

  return parts
}

export function getCollectionBySlug (collections, collectionName) {
  return collections.find(collection => collection.slug === collectionName)
}

export function formatDocumentUrls (collection) {

}

export function filterReferenceFields (collection) {
  return Object.keys(collection.fields)
    .filter(key => collection.fields[key].type === 'Reference')
    .map(key => Object.assign({key}, collection.fields[key]))
}