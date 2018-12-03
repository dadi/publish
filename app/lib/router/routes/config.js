'use strict'

const config = require(paths.config)
const request = require('request-promise')

module.exports = function (app) {
  if (!app) return

  app.get('/config', (req, res, next) => {
    let apis = config.get('apis')
    let mainApi = apis.length && apis[0]
    let emptyResponse = {
      config: null,
      routes: null
    }
    let accessToken = (req.cookies && req.cookies.accessToken) ||
      req.query.accessToken

    if (!accessToken || !mainApi) {
      return res.end(
        JSON.stringify(emptyResponse)
      )
    }

    let requestOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      json: true,
      uri: `${mainApi.host}:${mainApi.port}/api/client`
    }

    return request(requestOptions).then(({results}) => {
      if (results.length !== 1) {
        return Promise.reject()
      }

      let response = {
        client: results[0],
        config: config.get()
      }

      return res.end(
        JSON.stringify(response)
      )
    }).catch(() => {
      return res.end(
        JSON.stringify(emptyResponse)
      )
    })
  })
}
