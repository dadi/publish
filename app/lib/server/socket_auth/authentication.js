'use strict'

const Auth = function () {
  this.socket
}

Auth.prototype.attach = function (socket) {
  if (!socket) return

  this.socket = socket

  // Refresh the auth token
  const currentToken = socket.getAuthToken()
  if (currentToken) {
    this.socket.setAuthToken(currentToken, {})
  }

  this.socket.on('login', this.validateLogin.bind(this))
  this.socket.on('disconnect', this.handleDisconnect.bind(this))
}

Auth.prototype.handleDisconnect = function (data) {
  return
}

Auth.prototype.validateLogin = function (data, next) {
  if (!this.socket) {
    return next(null, 'Invalid socket')
  }
  if (!data || !data.user) {
    return next(null, 'Invalid user')
  } else {
    const token = Object.assign({}, {
      name: `${data.user.first_name} ${data.user.last_name}`,
      email: data.user.email,
      handle: data.user.handle,
      username: data.user._id
    })
    this.socket.setAuthToken(token)
    return next()
  }
}

module.exports = function () {
  return new Auth()
}

module.exports.Auth = Auth
