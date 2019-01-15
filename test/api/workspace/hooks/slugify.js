const slugify = require('slugify')

module.exports = function (obj, type, data) {
  if (obj[data.options.from]) {
    obj[data.options.to] = slugify(obj[data.options.from], { lower: true })
  }
  return obj
}