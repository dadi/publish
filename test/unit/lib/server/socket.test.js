const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Socket = require(`${__dirname}/../../../../app/lib/server/socket`).Socket
const config = require(paths.config)
const nock = require('nock')
const scServer = require('socketcluster-server')

let socket
let server

beforeEach(() => {
  jest.clearAllMocks()
  server = nock('http://127.0.0.1')
  socket = new Socket(server)
})

let mockAddMiddlware = jest.fn((eventDefinition, callback) => {
  if (socket && socket.server) {
    if (!socket.server._middleware) {
      socket.server._middleware = {}
    }
    socket.server._middleware[eventDefinition] = callback
  }
})
jest.mock('socketcluster-server', () => {
  return {
    attach: (app) => {
      return {
        MIDDLEWARE_PUBLISH_IN: 'publishIn',
        on: (type, callback) => {},
        addMiddleware: mockAddMiddlware
      }
    }
  }
})

describe('Socket', () => {
  it('should export function', () => {
    expect(socket).toBeInstanceOf(Object)
  })

  describe('Socket: no running server', () => {
    it('should return empty object', () => {
      socket = new Socket()
      expect(socket.server).toBeUndefined()
    })

    it('should not call addMiddleware', () => {
      jest.clearAllMocks()
      socket = new Socket()
      expect(mockAddMiddlware).not.toHaveBeenCalled()
    })
  })

  describe('Socket: add publishIn middleware', () => {
    it('should be instance of onPublish middleware', () => {
      expect(socket.addMiddleware().server._middleware.publishIn).toBe(socket.onPublish)
    })
  })
})
