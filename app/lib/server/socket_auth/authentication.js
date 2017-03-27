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
      let token = Object.assign({}, {
        name: `${data.user.first_name} ${data.user.last_name}`,
        email: data.user.email,
        handle: data.user.handle,
        username: data.user.username
      })
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
