'use strict'

import {reduce, unique} from 'lib/util/array'

const hiddenCollections = ['mediaStore']

const varients = [
  '/:group/:collection/document',
  '/:collection/document'
]

const map = {
  create: {
    create: true,
    edit: true,
    list: true
  },
  edit: {
    create: true,
    edit: true,
    list: true
  },
  list: {
    create: false,
    edit: false,
    list: false
  }
}

const parts = {
  create: {
    extend: ':section?',
    primary: ':collection/document/new',
    secondary: ':referencedField/new/:pos'
  },
  edit: {
    extend: ':section?',
    primary: ':collection/document/edit/:documentId',
    secondary: ':referencedField/:referencedId'
  },
  list: {
    extend: ':page?',
    primary: ':collection/documents',
    secondary: 'select/:referencedField'
  }
}

export function buildCollectionUrls (collections) {
  const depth = getDeepestCollection(collections)

  const depthMap = mapToDepth(depth, Object.keys(map))

  const create = appendGroup(buildRoutes(depthMap, 'create'))
  const edit = appendGroup(buildRoutes(depthMap, 'edit'))
  const list = appendGroup(buildRoutes(depthMap, 'list'))

  return {
    create,
    edit,
    list
  }
}

export function appendGroup (routes) {
  return routes.concat(routes.map(route => `:group/${route}`))
}

export function buildRoutes (maps, type) {
  return maps
    .filter(map => map.split('.').pop() === type)
    .map(map => {
      return map
        .split('.')
        .map((part, ind, arr) => {
          let out = (ind === 0) ? parts[part].primary : parts[part].secondary

          if (ind === arr.length - 1) out += `/${parts[part].extend}`

          return out
        })
        .join('/')
    })
}

export function mapToDepth (depth, nodes, limit = 0) {
  if (limit === depth) return nodes

  const subNodes = reduce(nodes
    .map(node => {
      const subNodes = Object.keys(map)
        .map(subNode => {
          if (!canExtend(node, subNode)) return

          return `${node}.${subNode}`
        })
        .filter(Boolean)

      return subNodes.length ? mapToDepth(depth, subNodes, limit + 1) : subNodes
    }))

  return nodes.concat(subNodes)
}

export function canExtend (node, next) {
  const prev = node
    .split('.')
    .pop()

  return map[prev][next]
}

export function getDeepestCollection (collections) {
  return Math.max(...collections.map(collection => getCollectionDepth(collections, collection, 0)))
}

export function getCollectionDepth (collections, collection, depth) {
  const fields = filterReferenceFields(collection)

  if (!fields.length) return depth

  return Math.max(...fieldReferenceDepth(collections, fields, depth))
}

export function fieldReferenceDepth (collections, fields, depth) {
  return fields
    .map(field => {
      const colName = field.settings.collection
      const subCol = getCollectionBySlug(collections, colName)

      // If the collection doesn't exist, or it is.
      if (!subCol || hiddenCollections.includes(colName)) return depth + 1

      // Check sub-collection for reference fields.
      return getCollectionDepth(collections, subCol, depth + 1)
    })
    .filter(Boolean)
}

export function filterReferenceFields (collection) {
  return Object.keys(collection.fields)
    .filter(key => collection.fields[key].type === 'Reference')
    .map(key => Object.assign({key}, collection.fields[key]))
}

export function getCollectionBySlug (collections, collectionName) {
  return collections.find(collection => collection.slug === collectionName)
}