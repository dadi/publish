'use strict'

/**
 * Validation
 * @type {Object}
 */
export const Validation = {
  /**
   * Email validation
   * @param  {String} value Value of the email field
   * @return {Boolean} Successful validation
   */
  email (value) {
    if (!value) return false

    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
  }
}