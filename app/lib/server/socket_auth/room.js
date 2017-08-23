'use strict'

const Room = function () {}

Room.prototype.getUsers = function (room, clients) {
  return Object.keys(clients).filter(key => {
    let client = clients[key]

    if (client.authToken) {
      if (client.channelSubscriptions[room]) {
        return true
      }
    }
  }).map(key => {
    let client = clients[key]

    return client.authToken
  })
}

Room.prototype.attach = function (scServer, socket) {
  let subscribe = (room, respond) => {
    // console.log(`subscribed to ${room}`)
    let users = this.getUsers(room, socket.server.clients)
    socket.exchange.publish(room, {type: 'userListChange', body: {users: users}})
  }

  let unsubscribe = (room, respond) => {
    // console.log(`unsubscribed from ${room}`)
    let users = this.getUsers(room, socket.server.clients)
    socket.exchange.publish(room, {type: 'userListChange', body: {users: users}})
  }

  let dropOut = (room, respond) => {
    // console.log(`drop out of ${room}`)
  }

  socket.on('subscribe', subscribe)
  socket.on('unsubscribe', unsubscribe)
  socket.on('dropOut', dropOut)
}

module.exports = function () {
  return new Room()
}

module.exports.Room = Room
