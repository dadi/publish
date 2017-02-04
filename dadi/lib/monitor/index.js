'use strict'

const DB = require(paths.lib.db)
const EventEmitter = require('events')
const _ = require('underscore')
const config = require(paths.config)
const moment = require('moment')
const Api = require(`${paths.lib.models}/api`)
const Collection = require(`${paths.lib.models}/collection`)

/**
 * Monitor Events Class
 */
class MonitorEvents extends EventEmitter {

}

/**
 * @Constructor
 * Remote Monitoring Module
 */
const Monitor = function () {
  this.db = new DB()
  if (config.get('monitor.enabled')) {
    this.createEvents()
    this.watchAPIs()
  }
}

/**
 * Watch  APIs
 * @param  {String} apiId Optional API _id. This is passed to the method when recalling the check through setTimeout
 */
Monitor.prototype.watchAPIs = function (apiId) {

  let filter = {collection: 'apis'}
  if (apiId) {
    filter._id = filter
  }

  // Get all active APIs and check their status
  this.getActiveAPIs().then((docs) => {
    _.each(docs.results, (result) => {
      this.checkAPIStatus(result)
    })
  })
}

Monitor.prototype.getActiveAPIs = function () {
  return this.db.get({collection: 'apis'})
}

Monitor.prototype.checkStillActive = function (_id) {
  return this.db.get({collection: 'apis', filter: {_id: _id}})
}

/**
 * Check API Status
 * @param  {DadiAPI} api      Configure instance of DADI api-wrapper
 * @param  {Object} apiEntry DB stored API object
 */
Monitor.prototype.checkAPIStatus = function (apiEntry) {
  let interval = setInterval(() => {
      // Check that the API still exists in the database
      this.checkStillActive(apiEntry._id).then((doc) => {
        if (doc.results.length) {
          this.checkStatus(doc.results[0])
        } else {
          // If the API is no longer in the databse, stop monitoring
          clearInterval(interval)
        }
      })
    },
    apiEntry.monitorFrequency || 6000  
  )
}

Monitor.prototype.checkStatus = function (apiEntry) {
  let api = new Api(apiEntry)
  api.getStatus().then((status) => {
    if (status) {
      this.monitorEvents.emit('apiStatusUp', status)

      // Get collections if configured to do so
      if (config.get('monitor.refreshCollections')) {
        
        api.getCollections().then((result) => {
          this.synchroniseCollections(api, result.collections, apiEntry)
        })
      }
      // Store the status if configured to do so
      if (config.get('monitor.store')) {
        this.storeStatus(apiEntry, status)
      }
    }
  })
}

Monitor.prototype.synchroniseCollections = function (api, collections, apiEntry) {
  let collection = new Collection()

  collection.getCollectionsByApi(apiEntry._id).then((results) => {
    let create = _.difference(_.pluck(collections, 'slug'), _.pluck(results, 'slug'))
    let del = _.difference(_.pluck(results, 'slug'), _.pluck(collections, 'slug'))
    let update = _.intersection(_.pluck(results, 'slug'), _.pluck(collections, 'slug'))

    // Insert collections
    let newCollections = _.filter(collections, (item) => {
        return _.contains(create, item.slug)
    })
    let updateCollections = _.filter(collections, (item) => {
        return _.contains(update, item.slug)
    })

    if (updateCollections.length) {
      this.appendCollectionConfig(api, updateCollections).then((collections) => {
        collection.update(collections, apiEntry)
      })
    }

    if (newCollections.length) {
      this.appendCollectionConfig(api, newCollections).then((collections) => {
        collection.insert(collections, apiEntry)
      })
    }
  })
}

Monitor.prototype.appendCollectionConfig = function (api, collections) {
  let queue = _.map(collections, (collection) => {
    return api.in(collection.slug)
   .getConfig().then((config) => {
    collection = Object.assign(collection, config)
   })
  })
  return Promise.all(queue).then(() => {
    return collections
  })
}

Monitor.prototype.storeStatus = function (apiEntry, status) {
  this.db.put({collection: 'apis', _id: apiEntry._id}, {
    status: status,
    lastUpdate: moment().unix().valueOf()
  }).then((doc) => {
    // Emit update event
    this.monitorEvents.emit('apiStatusChange', doc)
  })
}

/**
 * Create Events
 * Create Event Emitters
 */
Monitor.prototype.createEvents = function () {
  this.monitorEvents = new MonitorEvents()
  this.monitorEvents.on('apiStatusUp', (status) => {
    console.log('apiStatusUp')
  })
  this.monitorEvents.on('apiCollectionsUpdated', (api) => {
    console.log(`apiStatusChange for ${api._id}`)
  })
  this.monitorEvents.on('apiCollectionsUpdated', (api) => {
    console.log(`apiCollectionsUpdated for ${api._id}`)
  })
}

module.exports = function () {
  return new Monitor()
}

exports.Monitor = Monitor

