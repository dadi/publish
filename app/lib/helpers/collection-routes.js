'use strict'

const ArrayHelper = require(`${paths.lib.helpers}/array`)

const hiddenCollections = ['mediaStore']

const numberRegex = '[^\\d+$]'
const objectIdRegex = '[^[a-fA-F0-9]{24}]'
const slugRegex = '[^[a-z-]]'

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
    primary: `:collection${slugRegex}/new`,
    secondary: `:referencedField/new/:pos${numberRegex}`
  },
  edit: {
    extend: ':section?',
    primary: `:collection${slugRegex}/:documentId${objectIdRegex}`,
    secondary: `:referencedField/:referencedId${objectIdRegex}`
  },
  list: {
    extend: `:page?${numberRegex}`,
    primary: `:collection${slugRegex}`,
    secondary: `select/:referencedField`
  }
}

const CollectionRoutes = function () {

}

CollectionRoutes.prototype.generateApiRoutes = function (apiCollections) {
  const depth = this.getMaxDepth(apiCollections)
  const depthMap = this.mapToDepth(depth, Object.keys(map))

  const create = this.appendGroup(this.buildRoutes(depthMap, 'create'))
  const edit = this.appendGroup(this.buildRoutes(depthMap, 'edit'))
  const list = this.appendGroup(this.buildRoutes(depthMap, 'list'))

  return {
    create,
    edit,
    list
  }
}

CollectionRoutes.prototype.buildRoutes = function (maps, type) {
  return maps
    .filter(map => this.reduceToType(map, type))
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

CollectionRoutes.prototype.reduceToType = function (map, type) {
  if (typeof map !== 'string' || typeof type !== 'string') return false

  return map.split('.').pop() === type
}

CollectionRoutes.prototype.mapToDepth = function (depth, nodes, limit = 0) {
  if (limit === depth) return nodes

  const subNodes = ArrayHelper.reduce(nodes
    .map(node => {
      const subNodes = Object.keys(map)
        .map(subNode => {
          if (!this.canExtend(node, subNode)) return

          return `${node}.${subNode}`
        })
        .filter(Boolean)

      return subNodes.length ? this.mapToDepth(depth, subNodes, limit + 1) : subNodes
    }))

  return nodes.concat(subNodes)
}

CollectionRoutes.prototype.getDeepestCollection = function (collections) {
  return Math.max(...collections
    .map(collection => this.getCollectionDepth(collections, collection, 0)))
}

CollectionRoutes.prototype.getCollectionDepth = function (collections, collection, depth) {
  const fields = this.filterReferenceFields(collection)

  if (!fields.length) return depth

  return Math.max(...this.fieldReferenceDepth(collections, fields, depth))
}

CollectionRoutes.prototype.fieldReferenceDepth = function (collections, fields, depth) {
  return fields
    .map(field => {
      const colName = field.settings.collection
      const subCol = this.getCollectionBySlug(collections, colName)

      // If the collection doesn't exist, or it is hidden.
      if (!subCol || hiddenCollections.includes(colName)) return depth + 1

      // Check sub-collection for reference fields.
      return this.getCollectionDepth(collections, subCol, depth + 1)
    })
    .filter(Boolean)
}

CollectionRoutes.prototype.getMaxDepth = function (apiCollections) {
  return Math.max(...apiCollections
    .map(collections => this.getDeepestCollection(collections)))
}

CollectionRoutes.prototype.filterReferenceFields = function (collection) {
  return Object.keys(collection.fields)
    .filter(key => collection.fields[key].type === 'Reference')
    .map(key => Object.assign({key}, collection.fields[key]))
}

CollectionRoutes.prototype.canExtend = function (node, next) {
  const prev = node
    .split('.')
    .pop()

  return map[prev][next]
}

CollectionRoutes.prototype.appendGroup = function (routes) {
  if (!Array.isArray(routes)) return

  return routes
    .concat(routes.map(route => `:group${slugRegex}/${route}`))
}

CollectionRoutes.prototype.getCollectionBySlug = function (collections, collectionName) {
  return collections.find(collection => collection.slug === collectionName)
}

module.exports = function () {
  return new CollectionRoutes()
}

module.exports.CollectionRoutes = CollectionRoutes
