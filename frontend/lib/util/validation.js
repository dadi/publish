'use strict'

/**
 * @class  Valication
 */
export default class Validation {
  /**
   * @contructor
   * @param  {Object} rules [description]
   * @param  {Object|String|Array} value Value to be validated
   */
  constructor (rules, value) {
    // TO-DO :
    // Based on rules, pass value through chain of rules to determin validity.
  }
  /**
   * Email
   * @param  {String} value Email value
   * @return {Boolean} Regular expression test result
   */
  email (value) {
    if (!value) return false

    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
  }
}