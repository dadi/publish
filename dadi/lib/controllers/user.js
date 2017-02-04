'use strict'

const _ = require('underscore')
const UserModel = require(`${paths.lib.models}/user`)

const User = function () {}

User.prototype.post = function (req, res, next) {
  res.header('Content-Type', 'application/json')
  return new UserModel().create(req.params).then((user) => {
    if (!_.isUndefined(user)) {
      res.write(JSON.stringify(user, null, 2))
      res.end()
    } else {
      // Handle error
      res.end()
    }
  })
}

module.exports = function() {
  return new User()
}

module.exports.User = User