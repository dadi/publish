'use strict'

const path = require('path')
const global = require(path.resolve(path.join(__dirname, '../../app/globals'))) // eslint-disable-line
const config = require(paths.config)
const Api = require(`${paths.lib.models}/api`)

const userCollection = require('./collections/collection.users')

const APIInstall = function () {
  this.checkAuthCollectionExists()
    // .then(exists => {
      
    // })
  // this.checkAuthHookExists()
  //   .then(exists => {
     
  //   })
}

APIInstall.prototype.checkAuthCollectionExists = function () {
  console.log('Check Auth Collection')
  if (config.get('auth.enabled')) {
    const authAPI = config.get('auth')

    this.getCollection(authAPI)
      .then(collection => {
        if (!collection) {
          console.log('Collection not found')
          return this.createUserCollection(authAPI)
        }
        this.validateCollectionConfig(authAPI).then(isInvalid => {
          // if (isInvalid) {
            console.log('Collection schema invalid')
            return this.createUserCollection(authAPI)
          // }
        })
      })
  }
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
  const expectedFields = {
    first_name: {
      type: 'String'
    },
    last_name: {
      type: 'String'
    },
    email: {
      type: 'String'
    },
    bio: {
      type: 'String'
    },
    profileImage: {
      type: 'Reference',
      publish: {
        subType: 'Image'
      }
    },
    language: {
      type: 'String'
    },
    loginWithToken: {
      type: 'Boolean'
    },
    loginToken: {
      type: 'String'
    },
    timezone: {
      type: 'String'
    },
    datetimeFormat: {
      type: 'String'
    },
    password: {
      type: 'String'
    },
    handle: {
      type: 'String'
    }
  }

  const expectedFieldKeys = Object.keys(expectedFields)
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
    .then(res => console.log('response', res))
    .catch(e => console.log('error', e))
}


module.exports = function () {
  return new APIInstall()
}

module.exports.APIInstall = new APIInstall()
