'use strict'

import 'whatwg-fetch'

module.exports = () => {
  return fetch('/config', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())  
}
