'use strict'

module.exports.attach = function (scServer, socket) {
  let tokenExpiresInSeconds = 10 * 60

  let tokenRenewalIntervalInMilliseconds = Math.round(1000 * tokenExpiresInSeconds / 3)

  // Keep renewing the token (if there is one) at a predefined interval to make sure that
  // it doesn't expire while the connection is active.
  // let renewAuthTokenInterval = setInterval(() => {
  //   let currentToken = socket.getAuthToken()
  //   if (currentToken) {
  //     socket.setAuthToken(currentToken, {expiresIn: tokenExpiresInSeconds})
  //     // socket.setAuthToken(currentToken, {expiresIn: tokenExpiresInSeconds})
  //   }
  // }, tokenRenewalIntervalInMilliseconds)
  let currentToken = socket.getAuthToken()
  if (currentToken) {
    socket.setAuthToken(currentToken, {})
  }

  // socket.once('disconnect', () => {
  //   clearInterval(renewAuthTokenInterval)
  // })

  let validateLoginDetails = (loginDetails, respond) => {
    // Validation required here
    if (!loginDetails.user) {
      respond(null, 'Invalid user')
    } else {
      let token = {
        username: loginDetails.user.user
      }
      respond()
    }
  }
  socket.on('login', validateLoginDetails)
}
