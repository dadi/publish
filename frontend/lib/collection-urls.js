'use strict'

import {reduce, unique} from 'lib/util/array'

export function buildCollectionUrls (collections) {
  const createViewUrls = reduce(collections.map(collection => {
    const slug = collection.slug
    const pathChains = getFieldCollections(collections, collection, slug, [slug])

    return buildUrls(pathChains, 'create')
  })).filter(unique)

  const editViewUrls = reduce(collections.map(collection => {
    const slug = collection.slug
    const pathChains = getFieldCollections(collections, collection, slug, [slug])

    return buildUrls(pathChains, 'edit')
  })).filter(unique)

  const listViewUrls = reduce(collections.map(collection => {
    const slug = collection.slug
    const pathChains = getFieldCollections(collections, collection, slug, [slug])

    return buildUrls(pathChains, 'list')
  })).filter(unique)

  console.log({
    create: createViewUrls,
    edit: editViewUrls,
    list: listViewUrls
  })

  return {
    create: createViewUrls,
    edit: editViewUrls,
    list: listViewUrls
  }
}

export function buildUrls (pathChains, type) {
  const primaryPathChain = pathChains.shift()
  const primaryPaths = primaryDocumentPaths(type)
  const extendiblePrimaryPaths = primaryExtendibleDocumentPaths(primaryPathChain)

  if (!pathChains.length) return primaryPaths

  // All reference fields are mapped.
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

export function primaryDocumentPaths (type) {
  switch (type) {
    case 'create':
      return [
        '/:group/:collection/document/new/:section?',
        '/:collection/document/new/:section?'
      ]
    case 'edit':
      return [
        '/:group/:collection/document/edit/:documentId/:section?',
        '/:collection/document/edit/:documentId/:section?'
      ]
    case 'list':
      return [
        '/:group/:collection/documents/:page?',
        '/:collection/documents/:page?'
      ]
  }
}

export function primaryExtendibleDocumentPaths (collection) {
  return [
    '/:group/:collection/document/edit/:documentId',
    '/:collection/document/edit/:documentId',
    '/:group/:collection/document/new',
    '/:collection/document/new'
  ]
}

export function subDocumentPaths (previousPaths, elements, key, type) {
  return previousPaths.map(previousPath => {
    const resolvePaths = subDocumentPathForType(previousPath, type)

    if (key + 1 < elements.length) {
      const documentPaths = (type === 'list') ? convertListToEdit(resolvePaths) : resolvePaths

      return reduce(subDocumentPaths(documentPaths, elements, key + 1, type))
    }

    return resolvePaths
  })
}

export function subDocumentPathForType (previousPath, type) {
  switch (type) {
    case 'create':

      const paths = [
        `${previousPath}/:referencedField/new`
      ]

      if (previousPath.indexOf(':referencedField/new') >= 0) {
        const nestedCreate = previousPath
          .replace(
            ':referencedField/new',
            ':referencedField/edit/:referenceDocumentId/:referencedField/new'
          )

        paths.push(nestedCreate)
      }

      return paths
    case 'edit':

      return [`${previousPath}/edit/:referencedField/:referenceDocumentId`]
    case 'list':

      return [
        `${previousPath}/select/:referencedField`,
        `${previousPath}/select/:referencedField/:page?`
      ]
  }
}

export function convertListToEdit (listUrls) {
  return listUrls.map(listUrl => {
    return listUrl
      .replace('/select', '')
      .replace(':page?', 'edit/:referenceDocumentId')
      .replace('edit/:referencedField/select', 'edit/:referencedField/:referenceDocumentId/select')
  }).filter(Boolean)
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

export function dismantleListUrl (type, path) {
  const normPath = path
    .replace(/^\/|\/$/g, '')

  if (type === 'list') {
    listPaths(normPath)
  }
}

export function listPaths (path) {
  const parts = path
    .split('select')
    .map(part => part.replace(/^\/|\/$/g, ''))

  console.log(parts)
}