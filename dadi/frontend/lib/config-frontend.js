'use strict'

const config = require('../../config')

const whitelist = {
  app: true,
  apis: {
    name: true,
    host: true,
    port: true,
    version: true,
    database: true
  },
  ui: true,
  server: {
    port: true,
    host: true,
    authenticate: true
  },
  TZ: true,
  env: true
}

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

const Config = function () {
  return assign(whitelist)
}

module.exports = new Config()
