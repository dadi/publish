'use strict'

/**
 * @class  Validation
 */
export default class Validation {
  /**
   * Email
   * @param  {String} value Email value
   * @return {Boolean} Regular expression test result
   */
  email (value) {
    if (!value || typeof value !== 'string') return

    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
  }
}