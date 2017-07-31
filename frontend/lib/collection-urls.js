'use strict'

import {reduce} from 'lib/util/array'

export function buildCollectionUrls (collections) {
  const editViewUrls = reduce(collections.map(collection => {
    const slug = collection.slug
    const pathChains = getFieldCollections(collections, collection, slug, [slug])

    return buildUrls(pathChains, 'edit')
  }))

  const listViewUrls = reduce(collections.map(collection => {
    const slug = collection.slug
    const pathChains = getFieldCollections(collections, collection, slug, [slug])

    return buildUrls(pathChains, 'list')
  }))

  return {
    edit: editViewUrls,
    list: listViewUrls
  }
}

export function buildUrls (pathChains, type) {
  const primaryPathChain = pathChains.shift()
  const primaryPaths = primaryDocumentPaths(primaryPathChain, type)
  const extendiblePrimaryPaths = primaryExtendibleDocumentPaths(primaryPathChain)

  if (!pathChains.length) return primaryPaths

  return reduce(pathChains
    .map(chain => {
      const chainElements = chain.split('.')

      chainElements.shift() // Remove first part of chain

      return reduce(chainElements
        .map((piece, key) => {
          const subPaths = subDocumentPaths(extendiblePrimaryPaths, chainElements, key, type)

          return reduce(subPaths)
        })
        .filter(Boolean))
    }))
}

export function primaryDocumentPaths (collection, type) {
  return [
    '/:group/:collection/document/edit/:documentId/:section?',
    '/:collection/document/edit/:documentId/:section?',
    '/:group/:collection/document/new/:section?',
    '/:collection/document/new/:section?'
  ]
}

export function primaryExtendibleDocumentPaths (collection) {
  return [
    '/:group/:collection/document/edit/:documentId',
    '/:collection/document/edit/:documentId',
    '/:group/:collection/document/new',
    '/:collection/document/new'
  ]
}

export function subDocumentPaths (primaryPaths, elements, key, type) {
  return primaryPaths.map(primaryPath => {
    const resolvedSubDocumentPaths = type === 'edit' ? [
      `${primaryPath}/new/:referencedField/`,
      `${primaryPath}/edit/:referencedField/:referenceDocumentId`
    ] : [
      `${primaryPath}/select/:referencedField`,
      `${primaryPath}/select/:referencedField/:page?`
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