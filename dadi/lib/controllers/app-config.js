'use strict'

const config = require(paths.config)

const assign = (subj, pre) => {
  return Object.assign(...Object.keys(subj).map(key => {
    let keypath = pre ? `${pre}.${key}` : key

    if (typeof subj[key] === 'boolean') {
      return {[`${key}`]: config.has(keypath) ? config.get(keypath) : null}
    } else {
      if (Array.isArray(config.get(keypath))) {
        
        let items = config.get(keypath).map((val, pos) => {
          keypath = pre ? `${pre}.${pos}.${key}` : `${key}.${pos}`

          return assign(subj[key], keypath)
        })

        return {[`${key}`]: items}
      }
      return {[`${key}`]: assign(subj[key], keypath)}
    }
  }))
}

const AppConfigController = function () {

}

AppConfigController.prototype.get = function (req, res, next) {
  if (!req.is('application/json')) {
    res.end()

    return next()
  }

  res.header('Content-Type', 'application/json')

  let frontendConfig = assign(config.get('availableInFrontend'))
  res.end(JSON.stringify(frontendConfig))

  return next()
}

module.exports = function() {
  return new AppConfigController()
}

module.exports.AppConfigController = AppConfigController
