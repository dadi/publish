const bcrypt = require('bcrypt-as-promised')

const SALT_LENGTH = 10 //salt doesn't need to be super long

const Password = function () {}

/**
 * Hash password
 * - trap hash function with salting
 * @param {string} plaintext - password in Plaintext
 * @param {function} cb - callback function
 * @returns {function} - password as a result of bcrypt hash method
 */
Password.prototype.hash = function (plaintext) {
  return bcrypt.genSalt(SALT_LENGTH).then((err, salt) => {
    if (err) return err
    return bcrypt.hash(plaintext, salt)
  })
}

/**
 * Compare password
 * - wrapper for bcrypt compare
 * @param {string} plaintext - password in Plaintext
 * @param {string} hash - the password hash to be applied
 * @param {function} cb - callback function
 * @returns {function} - instance of bcrypt compare method
 */
Password.prototype.compare = function (plaintext, hash) {
    return bcrypt.compare(plaintext, hash)
}

module.exports = new Password()