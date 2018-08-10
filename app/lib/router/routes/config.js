'use strict'

const Collection = require(`${paths.lib.models}/collection`)
const config = require(paths.config)
const request = require('request-promise')

module.exports = function (app) {
  if (!app) return

  app.get('/config', (req, res, next) => {
    let emptyResponse = {
      config: null,
      routes: null
    }
    let accessToken = (req.cookies && req.cookies.accessToken) ||
      req.query.accessToken

    if (!accessToken) {
      return res.end(
        JSON.stringify(emptyResponse)
      )
    }

    let api = config.get('apis.0')
    let requestOptions = {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      json: true,
      uri: `${api.host}:${api.port}/api/client`
    }

    return request(requestOptions).then(({results}) => {
      if (results.length !== 1) {
        return Promise.reject()
      }

      return new Collection({accessToken})
        .buildCollectionRoutes()
        .then(routes => {
          let response = {
            client: results[0],
            config: config.get(),
            routes
          }

          return res.end(
            JSON.stringify(response)
          )
        })
    }).catch(() => {
      return res.end(
        JSON.stringify(emptyResponse)
      )
    })
  })
}
