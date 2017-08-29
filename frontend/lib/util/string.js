'use strict'

export const Format = {
  /**
   * Sentence case
   * @param  {String} value String to format
   * @return {String} Formatted result
   */
  sentenceCase (value) {
    if (typeof value !== 'string') return ''

    return value
      .split('.')
      .map(sentence => sentence[0].toUpperCase() + sentence.slice(1))
      .join('.')
  },

  /**
   * Slugify
   * @param  {String} value String to format
   * @return {String} Formatted result
   */
  slugify (value) {
    if (!value || typeof value !== 'string') return ''

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