'use strict'

const config = require(paths.config)
const Api = require(`${paths.lib.models}/api`)

const Session = function () {}

Session.prototype.authorise = function (email, password, next) {
  let authAPI = config.get('auth')

  if (!authAPI.enabled) return next(null)

  return new Api(authAPI)
    .in(authAPI.collection)
    .whereFieldIsEqualTo('email', email)
    .whereFieldIsEqualTo('password', password)
    .find({extractResults: true}).then(user => {
      if (user.length > 0) {
        return next(null, user[0])
      } else {
        return next(null)
      }
    }).catch(err => {
      return next(null, {err: 'MISSING_AUTH_API', value: err})
    })
}

module.exports = function () {
  return new Session()
}

module.exports.Session = Session
