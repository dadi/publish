'use strict'

const config = require(paths.config)
const AWS = require('aws-sdk')

const ImageFieldRoute = function (app) {

  if (config.get('Image.s3.enabled')) {
    this.initAWS()
    this.S3 = this.initS3()

    app.get({
      name: 'images3sign', // This allows us to reuse the auth request
      path: '/fields/image/s3/sign'
    }, 
    (req, res, next) => {
      res.header('Content-Type', 'application/json')
      let response = {route: req.route.name}

      if (req.isAuthenticated()) {
        if (req.query.fileName) {
          return this.getSignedResponse(req.query.fileName).then(resp => {
            res.write(JSON.stringify(Object.assign(response, resp)))
            res.end()
            return next()
          })
        } else {
          res.write(JSON.stringify( Object.assign(response, {err: 'Missing fileName'}) ))
          res.end()
          return next()
        }
      } else {
        res.write(JSON.stringify( Object.assign(response, {authorised: false}) ))
        res.end()
        return next()
      }
      
    })
  }
}

ImageFieldRoute.prototype.getSignedResponse = function (fileName) {
  return this.getS3SignedUrl(fileName).then(resp => {
    if (resp.err) {
      return {err: resp.err}
    } else {
      return {url: resp.url}
    }
  })
}

// S3
ImageFieldRoute.prototype.initAWS = function () {
  AWS.config.update({
    accessKeyId: config.get('Image.s3.accessKeyId'), 
    secretAccessKey: config.get('Image.s3.secretAccessKey')
  })

  if (config.get('Image.s3.region') && config.get('Image.s3.region') != '') {
    AWS.config.update({region: config.get('Image.s3.region')})
  }
}

ImageFieldRoute.prototype.initS3 = function () {
  return new AWS.S3({httpOptions: { timeout: 480000 }})
}

ImageFieldRoute.prototype.getS3SignedUrl = function (fileName) {
  return new Promise((resolve, reject) => {
    return this.S3
    .getSignedUrl('putObject', {Bucket: config.get('Image.s3.bucketName'), Key: fileName}, (err, url) => {
      return resolve({err, url})
    })
  })
}

module.exports = function (app) {
  return new ImageFieldRoute(app)
}