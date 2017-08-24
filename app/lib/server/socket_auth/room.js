'use strict'

const Room = function () {
  this.socket
}

Room.prototype.getUsers = function (room, clients) {
  if (typeof room !== 'string' || typeof clients !== 'object') return []

  return Object.keys(clients)
    .filter(key => clients[key].authToken && clients[key].channelSubscriptions[room])
    .map(key => clients[key].authToken)
}

Room.prototype.attach = function (socket) {
  if (!socket) return

  this.socket = socket

  socket.on('subscribe', this.userListDidChange.bind(this))
  socket.on('unsubscribe', this.userListDidChange.bind(this))
}

Room.prototype.userListDidChange = function (room) {
  if (!this.socket) return

  const users = this.getUsers(room, this.socket.server.clients)

  this.socket.exchange
    .publish(room, {type: 'userListChange', body: {users}})
}

module.exports = function () {
  return new Room()
}

module.exports.Room = Room
