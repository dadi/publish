'use strict'

import 'unfetch'

module.exports = () => {
  return fetch('/config', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => response.json())
}
