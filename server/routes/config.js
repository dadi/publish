const getDataForToken = require('../lib/get-data-for-token')

module.exports = server => {
  server.get('/_config', (req, res) => {
    const accessToken = (req.cookies && req.cookies.accessToken) ||
      req.query.accessToken
    
    return getDataForToken(accessToken).then(({api, client, config}) => {
      return res.end(
        JSON.stringify({api, client, config})
      )
    })
  })
}
