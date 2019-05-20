module.exports.sendJSON = (res, data, statusCode = 200) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify(data))
}