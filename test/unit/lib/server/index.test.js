const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Server = require(`${__dirname}/../../../../app/lib/server`).Server
const config = require(paths.config)

let server

beforeEach(() => {
  server = new Server
})

describe('Server', () => {
  it('should export function', () => {
    expect(server).toBeInstanceOf(Object)
  })

  describe('Start server', () => {
    it('', () => {
      console.log(server.start)
    })
  })
})

// Constructor √
// start
// createServer
// addListeners
// appListen

// describe('Start server', () => {
//   it('', () => {
    
//   })
// })
