'use strict'

const path = require('path')
const global = require(path.resolve(path.join(__dirname, '../../app/globals'))) // eslint-disable-line
const config = require(paths.config)
const Api = require(`${paths.lib.models}/api`)

const userCollection = require('./collections/collection.users')

const APIInstall = function () {
  if (config.get('auth.enabled')) {
    this.checkAuthCollectionExists()
      .then(resp => this.checkHooksExist())
  } else {
    console.log('No Authentication block in config')
  }
}

APIInstall.prototype.checkHooksExist = function () {
  // const authAPI = config.get('auth')
  // return this.getHooks(authAPI)
}

APIInstall.prototype.checkAuthCollectionExists = function () {
  const authAPI = config.get('auth')

  return this.getCollection(authAPI)
    .then(collection => {
      if (!collection) {
        console.log('Collection not found')
        return this.createUserCollection(authAPI)
      }
      return this.validateCollectionConfig(authAPI).then(isInvalid => {
        if (!isInvalid) {
          console.log('Collection schema invalid', isInvalid)
          return this.createUserCollection(authAPI)
        } else {
          console.log('Collection is Valid')
        }
      })
    })
}

APIInstall.prototype.getCollection = function (authAPI) {
  return new Api(authAPI)
    .getCollections()
    .then(result => result.collections.find(collection => Object.is(collection.slug, 'users')))
}

APIInstall.prototype.getHooks = function (authAPI) {
  // return new Api(authAPI)
    // .getHooks()
}

APIInstall.prototype.validateCollectionConfig = function (authAPI) {
  return new Api(authAPI)
    .in('users')
    .getConfig()
    .then(collectionConfig => this.checkFields(collectionConfig.fields))
}

APIInstall.prototype.checkFields = function (fields) {
  const expectedFieldKeys = Object.keys(userCollection)
  const actualFieldKeys = Object.keys(fields)

  return Boolean(expectedFieldKeys
    .filter(expectedField => !actualFieldKeys
      .find(actualField => Object.is(actualField, expectedField))
    ).length)
}

APIInstall.prototype.createUserCollection = function (authAPI) {
  console.log('Creating User Collection')

  return new Api(authAPI)
    .in('users')
    .setConfig(userCollection)
    .then(res => console.log(`Create User Collection: ${res.result}`))
    .catch(e => console.log('error', e))
}

module.exports = function () {
  return new APIInstall()
}

module.exports.APIInstall = new APIInstall()
