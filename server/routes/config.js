const getDataForToken = require('../lib/get-data-for-token')

module.exports = server =>
  server.get('/_config', async (req, res) =>
    res.json(await getDataForToken(req.query.accessToken))
  )
