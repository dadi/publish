'use strict'
// const config = require(GLOBAL.paths.config)
const _ = require('underscore')
const scServer = require('socketcluster-server')

/**
 * Web Socket instance
 */
const Socket = function (app) {
  this.server = scServer.attach(app)
  this.server.on('connection', this.onConnection.bind(this))
  this.addMiddleware()
  return this
}


/**
 * Add middleware so socket server instance
 * - PUBLISH_IN
 * - HANDSHAKE
 * - SUBSCRIBE
 */
Socket.prototype.addMiddleware = function () {
  this.server.addMiddleware(this.server.MIDDLEWARE_SUBSCRIBE, this.onSubscribe.bind(this))
  this.server.addMiddleware(this.server.MIDDLEWARE_HANDSHAKE, this.onHandshake.bind(this))
  this.server.addMiddleware(this.server.MIDDLEWARE_PUBLISH_IN, this.onPublish.bind(this))
}

/**
 * On Connection
 * @param  {scServer} socket Socket Cluster socket
 */
Socket.prototype.onConnection = function (socket) {
  console.log("Connection made")
  this.registerSocketListeners(socket)
  return this
}

/**
 * Register Socket Listener
 * When A client connects, register the listeners for this socket
 * @param  {scServer} socket Socket Cluster socket
 * @return {[type]}        [description]
 */
Socket.prototype.registerSocketListeners = function (socket) {
  socket.on('clientConnect', (data) => {
    this.clientConnect(data, socket)
  })
  return this
}

/**
 * On Handshake
 * Currently running as step-over only
 * @param  {req}   req  socket request
 * @param  {Function} next next sequential method
 * @return {Function}        next sequential method call
 */
Socket.prototype.onHandshake = function (req, next) {
  console.log("User handshake made")
   return next()
}

/**
 * On Subscribe
 * Runs as a user joins a channel
 * @param  {req}   req  socket request
 * @param  {Function} next next sequential method
 * @return {Function}        next sequential method call
 */
Socket.prototype.onSubscribe = function (req, next) {
  console.log("User subscribes to room")
  return next()
}

/**
 * Clear Deltas in current socket exchange
 * @param  {req} req socket request
 */
Socket.prototype.clearDeltas = function (req) {
  req.socket.exchange.deltas = []
}

/**
 * Get collaborators
 * Get collaborators in current room
 * @param  {req} req socket request
 * @return {object} collaborators List of collaborators
 */
Socket.prototype.getUsers = function (req) {
  var users = []
  _.each(req.socket.server.clients, (client) => {
    if (req.socket.server.clients) {
      if (client.authToken && (req.channel === client.authToken.channel || (req.data && req.data.channel === client.authToken.channel))) {
        users.push(client.authToken)
      }
    }
  })
  return users
}

/**
 * On Publish
 * Runs when a message is published
 * @param  {req}   req  socket request
 * @param  {Function} next next sequential method
 * @return {Function}        next sequential method call
 */
Socket.prototype.onPublish = function (req, next) {
  if (req.data && req.data.type) {
    switch(req.data.type) {
      case 'message':
        this.storeMessage(req.channel, req.data)
      break
      // case 'delta':
      //   this.storeDelta(req)
      // break
      case 'userWillEnter':
       req.socket.exchange.publish(req.channel, {type: 'userDidEnter', body: {users: this.getUsers(req)}})
      break
    }
  }
  return next()
}

// Socket.prototype.storeDelta = function (req) {
//   if (!req.socket.exchange.deltas) {
//     req.socket.exchange.deltas = []
//   }
//   req.socket.exchange.deltas.push(req.data)
// }

/**
 * Store message
 * @param  {object} channel Current user channel data
 * @param  {object} data    Payload data
 */
Socket.prototype.storeMessage = function (channel, data) {
  // Unsupported currently
  // var channelData = JSON.parse(channel)
  // var messageEntry = {
  //   collectionSlug: channelData.collection,
  //   documentId: channelData.documentId,
  //   message: data.data.value
  // }
  // var options = {
  //   id: channelData.api,
  //   collectionId: 'messages'
  // }
}

/**
 * Client Connect
 * @param  {object} data   client user data
 * @param  {scServer} socket Socket instance
 */
Socket.prototype.clientConnect = function (data, socket) {
  if (data.user) {
    console.log(`${data.user.user.name} connected`)
    var authToken = socket.getAuthToken()
    if (!authToken) {
      socket.setAuthToken(data.user)
    }
  }
}

module.exports  = function (app) {
  return new Socket(app)
}

module.exports.Socket = Socket