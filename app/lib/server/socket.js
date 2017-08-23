'use strict'
const scServer = require('socketcluster-server')
const Auth = require(`${paths.lib.server}/socket_auth/authentication`)
const Room = require(`${paths.lib.server}/socket_auth/room`)

/**
 * Web Socket instance
 */
const Socket = function (app) {
  if (!app) return

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
  this.server.addMiddleware(this.server.MIDDLEWARE_PUBLISH_IN, this.onPublish)

  return this
}

/**
 * On Connection
 * @param  {scServer} socket Socket Cluster socket
 */
Socket.prototype.onConnection = function (socket) {
  if (!this.server || !socket) return
  new Auth().attach(this.server, socket)
  new Room().attach(this.server, socket)

  return this
}

/**
 * On Publish
 * Runs when a message is published
 * @param  {req}   req  socket request
 * @param  {Function} next next sequential method
 * @return {Function}        next sequential method call
 */
Socket.prototype.onPublish = function (req, next) {
  if (req && req.data && req.data.type) {
    switch (req.data.type) {
      case 'getUsersInRoom':
        const users = new Room()
          .getUsers(req.channel, req.socket.server.clients)

        req.socket.exchange.publish(req.channel, {type: 'userListChange', body: {users: users}})
    }
  }
  if (next) {
    return next()
  }
}

module.exports = function (app) {
  return new Socket(app)
}

module.exports.Socket = Socket
