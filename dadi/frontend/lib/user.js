'use strict'

import 'whatwg-fetch'

const User = function () {}

User.prototype.createUser = function ({email, username, password, fullname}) {
  return fetch(`/user`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      username: username, 
      password: password,
      fullname: fullname
    })
  }).then(response => {
    return response.json().then(json => {
      return {
        signedIn: true,
        user: json
      }
    })
  })
}

module.exports = function () {
  return new User()
}

module.exports.User = User