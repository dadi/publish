const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Server = require(`${__dirname}/../../../../app/lib/server`)
const config = require(paths.config)

jest.mock(`${__dirname}/../../../../app/lib/server/socket`, () => {
  return () => {

  }
})

const mockCreatePrimaryServer = jest.fn()
const mockServer = {
  close: jest.fn()
}
let server

beforeEach(() => {
  server = new Server
})

afterEach(() => {
  const restartCalls = []
  if (server && server.primaryServer && !server.primaryServer.close._isMockFunction) {
    restartCalls.push(new Promise(resolve => {
      server.primaryServer.close(() => {
        resolve()
      }) 
    }))
  }
  if (server && server.redirectServer && !server.redirectServer.close._isMockFunction) {
    restartCalls.push(new Promise(resolve => {
      server.redirectServer.close(() => {
        resolve()
      }) 
    }))
  }

  config.set('server.ssl.enabled', true)

  return Promise.all(restartCalls)
})

describe('Server', () => {
  it('should export function', () => {
    expect(server).toBeInstanceOf(Object)
  })

  // describe('Start server', () => {
    // it('Should return success', () => {
    //   expect.assertions(1)

    //   return expect(server.start()).resolves.toBe('2 servers starter')
    // })

    // it('Should start two servers if SSL is disabled', () => {
    //   config.set('server.ssl.enabled', true)
    //   expect.assertions(1)

    //   return expect(server.start()).resolves.toBe('2 servers starter')
    // })

    // it('Should append all apis with Publish UUID', () => {
    //   expect.assertions(1)
     
    //   return expect(server.start()
    //     .then(resp => config.get('apis')))
    //     .resolves
    //     .toEqual(
    //       expect.arrayContaining([
    //         expect.objectContaining({
    //           publishId: expect.any(String)
    //         })
    //       ])
    //     )
    // })

    // it('Should start one server if SSL is disabled', () => {
    //   config.set('server.ssl.enabled', false)
    //   expect.assertions(1)

    //   return expect(server.start()).resolves.toBe('1 servers starter')
    // })
  // })

  describe('Restart server', () => {
    it('Should not attempt to close an uninitiated primaryServer', () => {
      server.createPrimaryServer = mockCreatePrimaryServer
      server.restartServers()

      expect(mockCreatePrimaryServer).not.toBeCalled()
    })

    it('Should call primaryServer.close if primaryServer exists', () => {
      server.primaryServer = mockServer
      server.restartServers()

      return expect(mockServer.close).toBeCalled()
    })

    it('Should call redirectServer.close if redirectServer exists', () => {
      server.redirectServer = mockServer
      server.restartServers()

      return expect(mockServer.close).toBeCalled()
    })
  })
})

// Constructor √
// start √
// restartServers √
// createPrimaryServer
// createRedirectServer
// addListeners
// appListen

// describe('Start server', () => {
//   it('', () => {
    
//   })
// })
