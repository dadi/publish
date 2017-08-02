'use strict'

import {reduce, unique} from 'lib/util/array'

const hiddenCollections = ['mediaStore']

const params = {
  collection: ':collection',
  docId: ':documentId',
  fieldRef: ':referencedField',
  fieldRefId: ':referencedFieldId',
  group: ':group',
  page: ':page',
  pos: ':pos',
  section: ':section'
}

const baseVarients = [
  `/${params.group}/:collection/document`,
  `/${params.collection}/document`
]

const protocol = {
  create: {
    ext: {
      extend: `new/${params.fieldRef}/${params.pos}`,
      initial: `new/${params.fieldRef}/${params.pos}`
    },
    extendable: {
      create: true,
      edit: false,
      list: true
    },
    prim: {
      extend: 'new',
      initial: `new/${params.section}?`
    }
  },
  edit: {
    ext: {
      extend: `${params.fieldRef}`,
      initial: `${params.fieldRef}/${params.fieldRefId}/${params.section}?`
    },
    extendable: {
      create: true,
      edit: true,
      list: true
    },
    prim: {
      extend: `edit/${params.docId}`,
      initial: `edit/${params.docId}/${params.section}?`
    }
  },
  list: {
    ext: {
      extend: `select/${params.fieldRef}`,
      initial: `select/${params.fieldRef}/${params.page}?`
    },
    extendable: {
      create: false,
      edit: false,
      list: false
    },
    prim: {
      initial: `${params.page}?`
    }
  }
}

export function buildCollectionUrls (collections) {
  const depth = getDeepestCollection(collections)
  const edit = getPrimaryUrls(depth, 'edit')
  const list = getPrimaryUrls(depth, 'list')
  const create = getPrimaryUrls(depth, 'create')

  console.log({
    create,
    edit,
    list,
  })

  return {
    create,
    edit,
    list
  }
}

export function getPrimaryUrls (depth, type) {
  const routes = baseVarients.map(extension => {
    const base = `${extension}/${protocol[type].prim.initial}`
    const sub = getSubUrls(base, type, depth).filter(unique)

    return [base].concat(sub)
  })

  return reduce(routes)
}

export function getSubUrls (base, type, depth, level = 0) {
  const proto = protocol[type]
  let out = []

  if (level === 0) {
    base = appendBase(base, type, proto.ext.initial)
  } else {
    base = appendSecondary(base, type, proto.ext.initial)
  }

  if (proto.extendable[type]) {
    const secondaryValue = `${base}/${proto.ext.initial}`

    out.push(secondaryValue)
  }

  if (level < depth - 1) {
    const alternates = getAlternates(base, type, proto.ext.initial, level)

    return out.concat(alternates)
  }

  return out
}

export function getAlternates (base, type, ext, level) {
  return Object.keys(protocol)
    .filter(key => key !== type)
    .map(subType => {
      const extension = level > 0 ? protocol[subType].ext : protocol[subType].prim

      return protocol[subType].extendable[type] ? `${base}/${extension.extend}/${ext}` : null
    })
    .filter(Boolean)
}

export function appendBase (base, type) {
  if (!protocol[type].extendable[type]) {
    return base.replace(`/${protocol[type].prim.initial}`, '')
  }

  return base.replace(protocol[type].prim.initial, protocol[type].prim.extend)
}

export function appendSecondary (base, type) {
  if (!protocol[type].extendable[type]) {
    return base.replace(`/${protocol[type].ext.initial}`, '')
  }

  return base.replace(protocol[type].ext.initial, protocol[type].ext.extend)
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