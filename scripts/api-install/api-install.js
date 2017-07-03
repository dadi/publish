'use strict'
const path = require('path')
const global = require(path.resolve(path.join(__dirname, '../../app/globals'))).Globals // eslint-disable-line

// Set config path when configDir param is set.
// E.g. NODE_ENV=development npm explore publish -- npm run api-install --configDir=/path/to/app/config
if (process.env.npm_config_configDir) {
  global.set({configDir: process.env.npm_config_configDir})
}

const config = require(paths.config)
const Api = require(`${paths.lib.models}/api`)
const fs = require('fs')


const userCollection = require('./collections/collection.users')
const slugifyHook = fs.readFileSync(path.resolve(path.join(__dirname, 'hooks/slugify.js')), 'utf8')
const publishAuthHook = fs.readFileSync(path.resolve(path.join(__dirname, './hooks/publish-auth.js')), 'utf8')

const APIInstall = function () {
  if (config.get('auth.enabled')) {
    this.checkAuthCollectionExists()
      .then(resp => this.checkHooksExist())
  } else {
    console.log('No Authentication block in config')
  }
}

APIInstall.prototype.checkHooksExist = function () {
  this.checkOrCreateHook('slugify', slugifyHook)
  this.checkOrCreateHook('publish-auth', publishAuthHook)
}

APIInstall.prototype.checkOrCreateHook = function (name, content) {
  const authAPI = config.get('auth')

  new Api(authAPI)
    .inHooks()
    .whereHookNameIs(name)
    .find()
    .then(resp => {
      if (resp !== content) {
        this.updateHook(name, content)
      } else {
        console.log(`${name} is already a valid hook!`)
      }
    })
    .catch(err => {
      this.createHook(name, content)
    })
}

APIInstall.prototype.createHook = function (name, content) {
  console.log(`Creating ${name}`)
  const authAPI = config.get('auth')
  new Api(authAPI)
    .inHooks()
    .whereHookNameIs(name)
    .create(content)
    .then(resp => console.log(`Successfully created ${name}`))
}

APIInstall.prototype.updateHook = function (name, content) {
  console.log(`Updating ${name}`)
  const authAPI = config.get('auth')
  new Api(authAPI)
    .inHooks()
    .whereHookNameIs(name)
    .update(content)
    .then(resp => console.log(`Successfully updated ${name}`))
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
    .catch(err => {
      console.log("ERROR", err.message)
      return this.createUserCollection(authAPI)
    })
}

APIInstall.prototype.getCollection = function (authAPI) {
  return new Api(authAPI)
    .getCollections()
    .then(result => result.collections.find(collection => Object.is(collection.slug, 'users')))
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
