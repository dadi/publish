const getDataForToken = require('../lib/get-data-for-token')
const packageJSON = require('../../package.json')

const template = ({client, config, error, version}) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>DADI Publish</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <meta name="mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="format-detection" content="telephone=no">
      <link rel="stylesheet" type="text/css" href="/_dist/main.css?v=${version}">
      <link rel="stylesheet" type="text/css" href="/_public/custom.css">
      <link rel="icon" type="image/png" href="/_public/images/favicon.png">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    </head>
    <body>
      <div id="app-fullscreen"></div>
      <div id="app"></div>
      <script>window.__client__ = ${JSON.stringify(client)}</script>
      <script>window.__config__ = ${JSON.stringify(config)}</script>
      <script>window.__error__ = ${JSON.stringify(error)}</script>
      <script>window.__version__ = ${JSON.stringify(version)}</script>
      <script src="/_dist/bundle.js?v=${version}"></script>
    </body>
  </html>
`

module.exports = server => {
  server.get('*', (req, res) => {
    const accessToken = req.cookies && req.cookies.accessToken

    res.header('Content-Type', 'text/html; charset=utf-8')

    return getDataForToken(accessToken).then(({client, config, error}) => {
      const html = template({
        client,
        config,
        error,
        version: packageJSON.version
      })

      return res.end(html)
    })
  })
}
