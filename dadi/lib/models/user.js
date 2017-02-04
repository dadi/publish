'use strict'

const _ = require('underscore')
const config = require(paths.config)
const DB = require(paths.lib.db)
const PasswordHelper = require(`${paths.lib.helpers}/password`)
const StringHelper = require(`${paths.lib.helpers}/string`)
const gravatar = require('gravatar')

const User = function () {
  this.collection = 'users'
}

User.prototype.find = function (query) {
  return new DB().get({
    collection: this.collection,
    filter: query
  }).then((data) => {
    if (!_.isUndefined(data.results) && data.results.length) {
      delete data.results[0].password
      return data.results[0]
    } else {
      return {}
    }
  })
  return {}
}
/**
 * Create User
 * @param  {String} options.email    Pre-validated email address
 * @param  {String} options.password Plaintext password
 * @param  {String} options.username Username
 * @param  {String} options.fullname [description]
 * @param  {String} options.token    Optional signup token
 * @return {Object}                  Inserted User Object
 * @example
 *  new User().create({
    email: 'test@test.com',
    password: 'fri3ndlygh0st',
    username: 'publishuser',
    fullname: 'DADI Publish'
  })
 */
User.prototype.create = function ({email, password, username, fullname, token}) {
  // Hash the password
  return PasswordHelper.hash(password).then((hash) => {
    // Create the user object
    var userData = {
      email: email,
      password: hash,
      slug: StringHelper.slugify(username),
      username: username, // No spaces, lowercase
      fullname: fullname,
      avatar: gravatar.url(email, {s: '100', r: 'pg', d: 'retro'})
    }
    if (token) {
      userData.tmp_token = token
      userData.active = false
    }
    return new DB().post({
      collection: this.collection
    }, userData)
  })
}

module.exports = function () {
  return new User()
}

module.exports.User = User