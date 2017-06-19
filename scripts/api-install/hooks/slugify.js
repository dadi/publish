'use strict'
// Hook: Creates a URL-friendly version (slug) of a field
const slugify = require('underscore.string/slugify')
const _ = require('underscore')

const getFieldValue = (fieldName, object) => {
  if (!fieldName) return
  fieldName = fieldName.split('.')
  _.each(fieldName, (child) => {
    if (!_.isUndefined(object[child])) {
      object = object[child]
    } else {
      return
    }
  })
  return object.length ? object : false
}

module.exports = (obj, type, data) => {
  let object = _.clone(obj)
  let field = getFieldValue(data.options.override, object) || getFieldValue(data.options.from, object)
  if (field) {
    obj[data.options.to] = slugify(field)
  }
  return obj
}
