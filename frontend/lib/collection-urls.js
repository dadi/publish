'use strict'

export function buildCollectionUrls (collections) {
  return reduce(collections.map(collection => {
    const slug = collection.slug
    const pathChains = getFieldCollections(collections, collection, slug, [slug])

    return buildUrls(pathChains)
  }))
}

export function buildUrls (pathChains) {
  const primaryPathChain = pathChains.shift()
  const primaryPaths = primaryDocumentPaths(primaryPathChain)
  const extendiblePrimaryPaths = primaryExtendibleDocumentPaths(primaryPathChain)

  if (!pathChains.length) return primaryPaths

  return reduce(pathChains
    .map(chain => {
      const chainElements = chain.split('.')

      chainElements.shift() // Remove first part of chain

      return reduce(chainElements
        .map((piece, key) => reduce(subDocumentPaths(extendiblePrimaryPaths, chainElements, key)))
        .filter(Boolean))
    }))
}

// Reduce multiple arrays into single concatinated array.
export function reduce (arrays) {
  return arrays.reduce((a, b) => a.concat(b))
}

export function primaryDocumentPaths (collection) {
  return [
    `/:group/${collection}/document/edit/:documentId/:section?`,
    `/${collection}/document/edit/:documentId/:section?`
  ]
}

export function primaryExtendibleDocumentPaths (collection) {
  return [
    `/:group/${collection}/document/edit/:documentId`,
    `/${collection}/document/edit/:documentId`
  ]
}

export function subDocumentPaths (primaryPaths, elements, key) {
  return primaryPaths.map(primaryPath => {
    const resolvedSubDocumentPaths = [
      `${primaryPath}/select/${elements[key]}`,
      `${primaryPath}/new/${elements[key]}`,
      `${primaryPath}/edit/${elements[key]}/:childDocumentId`
    ]

    if (key + 1 < elements.length) {
      return reduce(subDocumentPaths(resolvedSubDocumentPaths, elements, key + 1))
    }

    return resolvedSubDocumentPaths
  })
}

export function getFieldCollections (collections, collection, previous, parts) {
  const fields = filterReferenceFields(collection)

  if (!fields.length) return parts

  const referenceInstances = fields.map(field => {
    if (field.settings.collection === 'mediaStore') return [`${previous}.mediaStore`]
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