'use strict'
const scServer = require('socketcluster-server')
const authentication = require(`${paths.lib.server}/socket_auth/authentication`)

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
  authentication.attach(this.server, socket)
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
  socket.on('login', (data) => {
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
  if (req.socket.getAuthToken()) {
    next()
  } else {
    next('Cannot subscribe to ' + req.channel + ' channel without being logged in')
  }
}

/**
 * Get collaborators
 * Get collaborators in current room
 * @param  {req} req socket request
 * @return {object} collaborators List of collaborators
 */
Socket.prototype.getUsers = function (req) {
  let payload = req.data
  let users = []
  let user = payload.data.user
  // console.log("CHANNEL", payload.data, "\n")
  let clients = req.socket.server.clients
  // console.log(Object.keys(clients))
  Object.keys(clients).forEach(clientKey => {
    let client = clients[clientKey]
    if (client.authToken){
      // console.log("CURRENT", client.channelSubscriptions)
      if (client.channelSubscriptions[payload.data.channel]) {
        // console.log("USER", client.authToken.identifier, "IS CONNECTED", client.channelSubscriptions)
        users.push(client.authToken)
      }
    }
    // console.log("USER COUNT:", users.length)
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
      case 'userWillEnter':
        req.socket.exchange.publish(req.channel, {type: 'userDidEnter', body: {users: this.getUsers(req)}})
      break
      case 'userWillLeave':
        req.socket.exchange.publish(req.channel, {type: 'userDidLeave', body: {users: this.getUsers(req)}})
      break
    }
  }
  return next()
}

/**
 * Client Connect
 * @param  {object} data   client user data
 * @param  {scServer} socket Socket instance
 */
Socket.prototype.clientConnect = function (data, socket) {
  if (data.user) {
    console.log(`${data.user.username} connected`)
    let authToken = socket.getAuthToken()
    if (!authToken) {
      socket.setAuthToken(data.user)
    }
  }
}

module.exports  = function (app) {
  return new Socket(app)
}

module.exports.Socket = Socket