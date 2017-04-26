'use strict'

import {connect} from 'socketcluster-client'

/**
 * @constructor
 */
const Socket = function () {
  this.queuedTasks = []
  this.listeners = {}
  this.onConnectListeners = []
  this.socket = connect({port: location.port || 80})
  this.registerListeners()

  return this
}

/**
 * Register Listeners
 * Listens for connections and disconnections
 */
Socket.prototype.registerListeners = function () {
  this.socket.on('connect', this.onConnect.bind(this))
  this.socket.on('error', this.onError.bind(this))
}

Socket.prototype.onConnect = function () {
  //Register connection with server debug
  if (this.user) {
    this.user.channel = this.room
    if (!this.socket.getAuthToken()) {
      this.socket.emit('login', {user: this.user}, (err, failure) => {
        if (!err) {
          // Run all queued
          this.clearQueued()
        }
      })
    } else {
      this.clearQueued()
    }
  }
  this.onConnectListeners.forEach(connectListener => {
    connectListener()
  })

  return this
}

Socket.prototype.clearQueued = function () {
  this.queuedTasks.forEach(task => {
    task()
  })
}

Socket.prototype.isConnected = function () {
  return this.socket
}

Socket.prototype.setUser = function (data) {
  this.user = data

  return this
}

/*
 * Subscribe to single user channel
 */
Socket.prototype.subscribeToUserChannel = function () {
  if (this.socket.authToken) {
    this.socket.subscribe(this.socket.authToken.username)
  }
}

Socket.prototype.getUser = function () {
  return this.user
}

Socket.prototype.onError = function (err) {
  console.log(err)

  return
}

/**
 * Set Room
 * @param {Sting} room Room identifier.
 */
Socket.prototype.setRoom = function (room) {
  if (this.room === room) return this
  this.leaveRoom()
  this.room = room

  if (this.socket.getAuthToken()) {
    this.enterRoom()
  } else {
    this.queuedTasks.push(this.enterRoom.bind(this))
  }

  return this
}

/**
 * Get Room.
 * Return name of current room.
 */
Socket.prototype.getRoom = function () {
  return this.room
}

Socket.prototype.leaveRoom = function () {
  if (this.room) {
    this.socket.unsubscribe(this.room)
  }

  return this
}

Socket.prototype.enterRoom = function () {
  if (this.room) {
    this.channel = this.socket.subscribe(this.room)
    this.channel.on('subscribeFail', this.onRoomSubscribeFail.bind(this))
    this.channel.on('unsubscribe', this.onRoomUnSubscribe.bind(this))
    this.channel.on('subscribe', this.onRoomSubscribe.bind(this))
    if (this.socket.authToken) {
      this.publishMessage('getUsersInRoom', {
        channel: this.room,
        user: this.socket.authToken.username
      })
    }
  }

  return this
}

Socket.prototype.watchChannel = function (data) {
  if (this.listeners[data.type]) {
    if (typeof this.listeners[data.type] === 'function') {
      this.listeners[data.type](data)
    }
  }

  return this
}

Socket.prototype.on = function (type, callback) {
  this.listeners[type] = callback

  return this
}

Socket.prototype.publishMessage = function (type, data) {
  if (!this.channel) return
  this.channel.publish({data, type}, this.channelDidPublish)

  return this
}

Socket.prototype.channelDidPublish = function () {
  //Channel publish was successful
  return this
}

Socket.prototype.onRoomUnSubscribe = function () {
  if (this.channel) {
    this.channel.unwatch()
    this.socket.unsubscribe(this.room)
  }

  return this
}

Socket.prototype.onRoomSubscribe = function () {
  if (this.channel) {
    this.channel.watch(this.watchChannel.bind(this))
  }

  return this
}

Socket.prototype.onRoomSubscribeFail = function (err) {
  //Room subscription failer
  console.log('ROOM SUBSCRIBE FAIL', err)

  return this
}

module.exports = function () {
  return new Socket()
}

module.Socket = Socket