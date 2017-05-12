'use strict'

export const Format = {
  /**
   * Camel case
   * @param  {String} value String to format
   * @return {String} Formatted result
   */
  camelCase (value) {
    return value
      .replace(/\s(.)/g, $1 => $1.toUpperCase())
      .replace(/\s/g, '')
      .replace(/^(.)/, $1 => $1.toUpperCase())
  },

  /**
   * Sentence case
   * @param  {String} value String to format
   * @return {String} Formatted result
   */
  sentenceCase (value) {
    if (!value) return ''

    return value
      .split('.')
      .map(sentence => {
        return sentence[0].toUpperCase() + sentence.slice(1)
      })
      .join('.')
  },

  /**
   * Slugify
   * @param  {String} value String to format
   * @return {String} Formatted result
   */
  slugify (value) {
    return value.toString()
      .toLowerCase()
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/\/+/g, '-')     // Replace slashes with -
      .replace(/[^\w-]+/g, '')  // Remove all non-word chars
      .replace(/--+/g, '-')     // Replace multiple - with single -
      .replace(/^-+/, '')       // Trim - from start of text
      .replace(/-+$/, '')       // Trim - from end of text
  }
}