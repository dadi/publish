'use strict'

const _ = require('underscore')
const User = require(`${paths.lib.models}/user`)

const Session = function () {}

Session.prototype.authorise = function (username, password, next) {
  // return new User().find({
  //   username: username,
  //   password: password // Needs encryption
  // }).then((user) => {
  //   if (!_.isUndefined(user)) {
  //     return next(null, user)
  //   } else {
  //     return next(null)
  //   }
  // })
  return next(null)
}

module.exports = function() {
  return new Session()
}

module.exports.Session = Session