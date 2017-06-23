const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Socket = require(`${__dirname}/../../../../app/lib/server/socket`).Socket
const config = require(paths.config)
const nock = require('nock')
const EventEmitter = require('events').EventEmitter
const scServer = require('socketcluster-server')

let socket
let server

beforeEach(() => {
  jest.clearAllMocks()
  server = nock('http://127.0.0.1')
  socket = new Socket(server)
})

const mockSocketExcangePublish = jest.fn((channel, message) => {})

const mockClients = [{
  authToken: 'mockAuthToken',
  name: 'mockName',
  email: 'mockEmail',
  handle: 'mockHandle',
  username: 'mockUsername',
  channelSubscriptions: {
    mockChannel: true
  }
}]

const req = {
  data: {
    type: 'getUsersInRoom'
  },
  channel: 'mockChannel',
  socket: {
    exchange: {
      publish: mockSocketExcangePublish
    },
    server: {
      clients: mockClients
    }
  }
}

const mockAddMiddlware = jest.fn((eventDefinition, callback) => {
  if (socket && socket.server) {
    if (!socket.server._middleware) {
      socket.server._middleware = {}
    }
    socket.server._middleware[eventDefinition] = callback
  }
})

const mockOnFn = jest.fn((type, callback) => {})
const mockGetAuthToken = jest.fn(() => {})
const mockNext = jest.fn(() => {})

jest.mock('socketcluster-server', () => {
  return {
    attach: (app) => {
      return {
        MIDDLEWARE_PUBLISH_IN: 'publishIn',
        on: mockOnFn,
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
    it('should return undefined', () => {
      socket = new Socket()
      expect(socket.server).toBeUndefined()
    })

    it('should not call addMiddleware', () => {
      jest.clearAllMocks()
      socket = new Socket()
      expect(mockAddMiddlware).not.toHaveBeenCalled()
    })

    it('should not add connection EventEmitter', () => {
      jest.clearAllMocks()
      socket = new Socket()
      expect(mockOnFn).not.toHaveBeenCalled()
    })
  })

  describe('Socket: add publishIn middleware', () => {
    it('should be instance of onPublish middleware', () => {
      expect(socket.addMiddleware().server._middleware.publishIn).toBe(socket.onPublish)
    })
  })

  describe('Socket: call onConnection without socket', () => {
    it('should return undefined', () => {
      expect(socket.onConnection()).toBeUndefined()
    })
  })

  describe('Socket: call onConnection without socket bound to server', () => {
    it('should return undefined', () => {
      socket = new Socket()
      expect(socket.onConnection(socket)).toBeUndefined()
    })
  })

  describe('Socket: call onConnection with socket successfully bound to server', () => {
    it('should call EventEmitter', () => {
      socket.getAuthToken = mockGetAuthToken
      socket.on = mockOnFn
      socket.onConnection(socket)
      expect(mockOnFn).toHaveBeenCalled()
    })

    it('should call getAuthToken', () => {
      socket.getAuthToken = mockGetAuthToken
      socket.on = mockOnFn
      socket.onConnection(socket)
      expect(mockGetAuthToken).toHaveBeenCalled()
    })

    it('should return socket object with server', () => {
      socket.getAuthToken = mockGetAuthToken
      socket.on = mockOnFn
      socket.onConnection(socket)
      expect(socket.server).not.toBeUndefined()
    })
  })

  describe('Socket: call onPublish without req data or next method', () => {
    it('should not call next', () => {
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('Socket: call onPublish without req data', () => {
    it('should return next', () => {
      socket.onPublish(null, mockNext)
      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('Socket: call onPublish with req data', () => {
    it('should call socket.exchange.publish', () => {
      socket.onPublish(req, mockNext)
      expect(mockSocketExcangePublish).toHaveBeenCalled()
    })
  })
})

// Constructor √
// addMiddleware √
// onConnection √
// - Unable to test new Auth instance call
// - Unable to test new Room instance call
// onPublish √
