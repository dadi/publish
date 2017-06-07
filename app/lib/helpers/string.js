'use strict'

class StringHelper {
  /*
   Creates a URL/filename friendly version (slug) of any object that implements `toString()`
   @param {Object} input - object to be slugified
   */
  Slugify (input = '') {
    return input.toString()
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/\/+/g, '-')     // Replace slashes with -
      .replace(/[^\w-]+/g, '') // Remove all non-word chars
      .replace(/--+/g, '-')   // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '')       // Trim - from end of text
  }
}
module.exports = new StringHelper()
