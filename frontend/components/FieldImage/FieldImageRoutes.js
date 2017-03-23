'use strict'

const config = require(paths.config)
const AWS = require('aws-sdk')

const ImageFieldRoute = function (app) {
  if (config.get('FieldImage.s3.enabled')) {
    this.initAWS()
    this.S3 = this.initS3()

    app.post({
      name: 'images3sign', // This allows us to reuse the auth request
      path: '/fields/image/s3/sign'
    },
    (req, res, next) => {
      res.header('Content-Type', 'application/json')
      let response = {route: req.route.name}

      if (req.isAuthenticated()) {
        if (req.params && req.params.fileName) {
          return this.getSignedResponse(req.params.fileName, req.headers).then(resp => {
            res.write(JSON.stringify(Object.assign(response, resp)))
            res.end()

            return next()
          })
        } else {
          // No fileName
          res.write(JSON.stringify(Object.assign(response, {err: 'Missing fileName'})))
        }
      } else {
        // No session
        res.write(JSON.stringify(Object.assign(response, {authorised: false})))
      }

      res.end()

      return next()
    })
  }
}

ImageFieldRoute.prototype.getSignedResponse = function (fileName, headers) {
  return this.getS3SignedUrl(fileName, headers).then(resp => {
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
    accessKeyId: config.get('FieldImage.s3.accessKeyId'),
    secretAccessKey: config.get('FieldImage.s3.secretAccessKey')
  })

  if (config.get('FieldImage.s3.region') && config.get('FieldImage.s3.region') != '') {
    AWS.config.update({region: config.get('FieldImage.s3.region')})
  }
}

ImageFieldRoute.prototype.initS3 = function () {
  return new AWS.S3({httpOptions: {timeout: 480000}})
}

ImageFieldRoute.prototype.getS3SignedUrl = function (fileName, headers) {
  return new Promise((resolve, reject) => {
    let obj = {
      ACL: 'public-read',
      Bucket: config.get('FieldImage.s3.bucketName'),
      ContentType: headers.contenttype,
      Expires: 600,
      Key: fileName
    }

    return this.S3
    .getSignedUrl('putObject', obj, (err, url) => {
      return resolve({err, url})
    })
  })
}

module.exports = function (app) {
  return new ImageFieldRoute(app)
}