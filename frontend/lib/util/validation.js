'use strict'

/**
 * Validation
 * @param {Object} options.validation} Validation rules
 */
export default function Validation ({
  validation
} = {}) {
  /**
   * Email validation
   * @param  {String} value Value of the email field
   * @return {Boolean} Successful validation
   */
  return {
    email (value) {
      if (!value) return false

      return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
    }
  }
}