const Server = function () {
  return this
}

Server.prototype.use = function () {
  return this
}

Server.prototype.pre = function () {
  return this
}

Server.prototype.post = function () {
  return this
}

Server.prototype.get = function () {
  return this
}

Server.prototype.put = function () {
  return this
}

Server.prototype.del = function () {
  return this
}

Server.prototype.head = function () {
  return this
}

Server.prototype.close = function (callback) {
  return callback()
}

Server.prototype.listen = function (port, host, callback) {
  return callback()
}

Server.prototype.sanitizePath = function () {
  return this
}

const Restify = function () {
  this.pre = {
    sanitizePath: this.sanitizePath,
  }
  this.initialize = () => {}
  this.session = () => {}
  this.serializeUser = () => {}
  this.deserializeUser = () => {}

  return this
}

Restify.prototype.createServer = function (options) {
  return new Server()
}

Restify.prototype.use = function () {
  return this
}

Restify.prototype.sanitizePath = function () {
  return this
}

Restify.prototype.gzipResponse = function () {
  return this
}

Restify.prototype.requestLogger = function () {
  return this
}

Restify.prototype.queryParser = function () {
  return this
}

Restify.prototype.bodyParser = function () {
  return this
}

Restify.prototype.throttle = function () {
  return this
}

Restify.prototype.serveStatic = function () {
  return this
}

module.exports = new Restify()
module.exports.Server = Server
