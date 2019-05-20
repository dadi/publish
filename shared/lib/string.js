/**
 * Transform a string into sentence case.
 *
 * @param  {String} value
 * @return {String}
 */
module.exports.sentenceCase = value => {
  if (typeof value !== 'string') return ''

  return value
    .split('.')
    .map(sentence => sentence[0].toUpperCase() + sentence.slice(1))
    .join('.')
},

/**
 * Transform a string into a URL-friendly slug.
 *
 * @param  {String}
 * @return {String}
 */
module.exports.slugify = value => {
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
