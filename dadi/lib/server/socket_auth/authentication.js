'use strict'

const Auth = function () {}

Auth.prototype.attach = function (scServer, socket) {
  let currentToken = socket.getAuthToken()
  if (currentToken) {
    socket.setAuthToken(currentToken, {})
  }

  let validateLoginAndAuth = (data, respond) => {
    if (!data.user) {
      respond(null, 'Invalid user')
    } else {
      let token = {
        username: data.user.identifier, // username
        vendor: data.user.vendor
      }
      socket.setAuthToken(token)
      respond()
    }
  }

  socket.on('login', validateLoginAndAuth)
  socket.on('disconnect', data => {
    // console.log("Disconnected")
  })
}

module.exports = function () {
  return new Auth()
}

module.exports.Auth = Auth
