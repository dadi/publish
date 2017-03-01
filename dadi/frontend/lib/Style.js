/**
 * @constructor
 */
const Style = function (styles, ...initClasses) {
  this.classes = initClasses
  this.styles = styles
}

/**
 * Adds the given class name to the list of classes.
 *
 * @param {string} className - Name of the class to add.
 *
 * @return {Style} The Style instance.
 */
Style.prototype.add = function (className) {
  if ((typeof className === 'string') && this.styles[className]) {
    this.classes.push(className)
  }

  return this
}

/**
 * Adds the given class name to the list of classes if
 * the given condition is met (if it's not `falsy`).
 *
 * @param {string} className - Name of the class to add.
 * @param {mixed} condition - The condition to test.
 *
 * @return {Style}
 */
Style.prototype.addIf = function (className, condition) {
  if (!condition) return this

  return this.add(className)
}

/**
 * Returns a space-separated string with all the resolved
 * class names.
 *
 * @return {string} The rendered class names.
 */
Style.prototype.getClasses = function () {
  return this.classes.map(className => this.styles[className]).join(' ')
}

export default Style
