'use strict'

const config = require(paths.config)
const AWS = require('aws-sdk')

const ImageFieldRoute = function (app) {

  if (config.get('Image.s3.enabled')) {
    this.initAWS()
    this.s3 = this.initS3()
    app.get({
      name: 'images3sign', // This allows us to reuse the auth request
      path: '/fields/image/s3/sign'
    }, 
    (req, res, next) => {
      res.header('Content-Type', 'application/json')
      if (req.isAuthenticated()) {
        return this.refreshTemporaryCredentials().then(token => {
          res.write(JSON.stringify({route: req.route.name, token: AWS.config.credentials.sessionToken}))
          res.end()
          return next()
        })
      } else {
        res.write(JSON.stringify({route: req.route.name, authorised: false}))
        res.end()
        return next()
      }
      
    })
  }

}
// S3
ImageFieldRoute.prototype.initAWS = function () {
  AWS.config.update({
    accessKeyId: config.get('Image.s3.accessKeyId'), 
    secretAccessKey: config.get('Image.s3.secretAccessKey')
  })

  if (config.get('Image.s3.region') && config.get('Image.s3.region') != "") {
    AWS.config.update({region: config.get('Image.s3.region')})
  }
  AWS.config.credentials = new AWS.TemporaryCredentials()
}

ImageFieldRoute.prototype.initS3 = function () {
  return new AWS.S3({httpOptions: { timeout: 480000 }})
}


ImageFieldRoute.prototype.refreshTemporaryCredentials = function () {
  return new Promise((resolve, reject) => {
    return AWS.config.credentials.refresh(resolve)
  })
}

module.exports = function (app) {
  return new ImageFieldRoute(app)
}