// const restify = require('restify')

// const pre = jest.fn(() => restify)
// const use = jest.fn(() => restify)

// restify.createServer = jest.fn(() => {
//   return {
//     pre,
//     use
//   }
// })

module.exports = () => {
  return {
    createServer: () => {
      return this
    },
    use: () => {
      return this
    },
    pre: () => {
      return this
    }
  }
}