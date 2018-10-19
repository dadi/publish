const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const Server = require(`${__dirname}/../../../../../app/lib/server`)
const Router = require(`${__dirname}/../../../../../app/lib/router`)
const Socket = require(`${__dirname}/../../../../../app/lib/server/socket`)
const config = require(paths.config)
// const SSL = require('@dadi/ssl')
const restify = require('restify')

jest.mock(`${__dirname}/../../../../../app/lib/server/socket`, () => {
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

  // config.set('server.ssl.enabled', true)

  if (restify.createServer._isMockFunction) {
    restify.createServer.mockRestore()
  }

  return Promise.all(restartCalls)
})

describe('Server', () => {
  it('should export function', () => {
    expect(server).toBeInstanceOf(Object)
  })

  describe('Start server', () => {
    it.skip('Should return success', () => {
      expect.assertions(1)

      return expect(server.start()).resolves.toBe('2 servers starter')
    })

    it.skip('Should start two servers if SSL is disabled', () => {
      expect.assertions(1)

      return expect(server.start()).resolves.toBe('2 servers starter')
    })

    it('Should append all apis with Publish UUID', () => {
      expect.assertions(1)
     
      return expect(server.start()
        .then(resp => config.get('apis')))
        .resolves
        .toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              publishId: expect.any(String)
            })
          ])
        )
    })

    it.skip('Should start one server if SSL is disabled', () => {
      // config.set('server.ssl.enabled', false)
      expect.assertions(1)

      return expect(server.start()).resolves.toBe('1 servers starter')
    })
  })

  describe.skip('Restart server', () => {
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

  describe('createPrimaryServer()', () => {
    it.skip('should call restify.createServer with secure options when ssl is enabled.', () => {
      const createServerSpy = jest.spyOn(restify, 'createServer')

      server.createPrimaryServer()

      expect(createServerSpy)
        .toBeCalledWith(expect.objectContaining({
          port: 443,
          secure: true
        }))
    })

    it.skip('should call restify.createServer without secure options when ssl is disabled.', () => {
      // Set port back to original in config.test
      config.set('server.port', 3000)
      // Disable SSL (default: enabled)
      // config.set('server.ssl.enabled', false)

      const createServerSpy = jest.spyOn(restify, 'createServer')
      server.createPrimaryServer()

      expect(createServerSpy)
        .toBeCalledWith(expect.objectContaining({
          port: 3000
        }))
    })

    it('should return a promise', () => {
      expect(server.createPrimaryServer()).toBeInstanceOf(Promise)
    })

    it('should set primaryServer to be instance of restify.', () => {
      server.createPrimaryServer()
      expect(server.primaryServer).toBeInstanceOf(restify.Server)
    })

    it('should create a new socket instance.', () => {
      expect.assertions(1)

      const checkSocketExists = () => {
        return server.createPrimaryServer()
          .then(() => server.socket)
      }

      return expect(checkSocketExists()).resolves.toBeInstanceOf(Socket)
    })
  })

  describe('addListeners()', () => {
    it('should throw an error if the port is invalid.', () => {
      const serverListenMock = jest.fn()
      const mockRestifyServer = restify.createServer({})
      const addListenerCall = () => {
        return server.addListeners(mockRestifyServer, {})
      }

      expect(addListenerCall)
        .toThrowError('Port must be a valid Number.')
    })

    it('should throw an error if the host is invalid.', () => {
      const serverListenMock = jest.fn()
      const mockRestifyServer = restify.createServer({})
      const addListenerCall = () => {
        return server.addListeners(mockRestifyServer, {port: 80})
      }

      expect(addListenerCall)
        .toThrowError('Host must be a valid String.')
    })

    it('should return a promise', () => {
      const serverListenMock = jest.fn()
      const mockRestifyServer = restify.createServer({})

      expect(server.addListeners(mockRestifyServer, {
        port: 80,
        host: '0.0.0.0'
      })).toBeInstanceOf(Promise)
    })

    it('should call server.listen with correct ports and a callback method.', () => {
      const serverListenMock = jest.fn()
      const mockRestifyServer = restify.createServer({})
      mockRestifyServer.listen = serverListenMock

      server.addListeners(mockRestifyServer, {
        port: 80,
        host: '0.0.0.0'
      })
      expect(serverListenMock)
        .toBeCalledWith(80, '0.0.0.0', expect.any(Function))
    })
  })

  describe.skip('createRedirectServer()', () => {
    it('should start a restify server with port 80', () => {
      const createServerSpy = jest.spyOn(restify, 'createServer')

      server.createRedirectServer()

      expect(createServerSpy)
        .toBeCalledWith(expect.objectContaining({
          port: 80
        }))
    })

    it('should add ssl listeners to the redirect server', () => {
      const addSSLSpy = jest.spyOn(server, 'addSSL')

      server.createRedirectServer()

      expect(addSSLSpy)
        .toBeCalledWith(server.redirectServer)
    })

    it('should add routes to the redirect server', () => {
      server.createRedirectServer()

      expect(server.redirectServer.chain)
        .toEqual(expect.arrayContaining([expect.any(Function)]))
    })

    it('should return a promise', () => {
      expect(server.createRedirectServer()).toBeInstanceOf(Promise)
    })
  })
})
