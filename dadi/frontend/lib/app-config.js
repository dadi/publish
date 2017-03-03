'use strict'

import 'fetch'

module.exports = () => {
  return fetch('/config', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())  
}
