'use strict'

const StringHelper = function () {

}

StringHelper.prototype.slugify = function (input) {
  return input.toString()
    .toLowerCase()
    .replace(/[\?\#][\s\S]*$/g, '')
    .replace(/\/+/g, '-')
    .replace(/\s+/g, '')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/*
 Creates a URL/filename friendly version (slug) of any object that implements `toString()`
 @param {Object} input - object to be slugified
 */
module.exports = new StringHelper()
