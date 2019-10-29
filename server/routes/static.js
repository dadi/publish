const path = require('path')
const restify = require('restify')

module.exports = server => {
  // Route for build-generated artifacts.
  server.get(
    '/_dist/*',
    restify.plugins.serveStatic({
      appendRequestPath: false,
      directory: path.resolve(__dirname, '../../dist')
    })
  )

  // Route for public assets.
  server.get('/_public/*', (req, res, next) => {
    restify.plugins.serveStaticFiles(
      path.join(process.cwd(), 'workspace', 'public')
    )(req, res, err => {
      if (err) {
        restify.plugins.serveStaticFiles(
          path.resolve(__dirname, '../../public')
        )(req, res, next)
      }
    })
  })
}
