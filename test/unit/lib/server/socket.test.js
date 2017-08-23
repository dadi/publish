const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Socket = require(`${__dirname}/../../../../app/lib/server/socket`).Socket
const Auth = require(`${__dirname}/../../../../app/lib/server/socket_auth/authentication`)
const Room = require(`${__dirname}/../../../../app/lib/server/socket_auth/room`)
const config = require(paths.config)
const nock = require('nock')
const EventEmitter = require('events').EventEmitter
const scServer = require('socketcluster-server')

let socket
let server
let returnAuthDisabledSpy
let authAttachSpy
let roomAttachSpy

const mockOnFn = jest.fn((type, callback) => {})
const mockGetAuthToken = jest.fn(() => {})
const mockNext = jest.fn(() => {})

jest.mock('socketcluster-server', () => {
  return {
    attach: jest.fn((app) => {
      return {
        MIDDLEWARE_PUBLISH_IN: 'publishIn',
        on: mockOnFn,
        addMiddleware: mockAddMiddlware
      }
    })
  }
})

beforeEach(() => {
  jest.clearAllMocks()
  server = nock('http://127.0.0.1')
  returnAuthDisabledSpy = jest.spyOn(scServer, 'attach')
  authAttachSpy = jest.spyOn(Auth.Auth.prototype, 'attach')
  roomAttachSpy = jest.spyOn(Room.Room.prototype, 'attach')
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

describe('Socket', () => {
  it('should export function', () => {
    expect(socket).toBeInstanceOf(Object)
  })

  it('should return undefined if server is undefined', () => {
    jest.clearAllMocks()
    socket = new Socket()

    expect(socket.server).toBeUndefined()
  })

  it('should not call addMiddleware if server is undefined', () => {
    jest.clearAllMocks()
    socket = new Socket()

    expect(mockAddMiddlware).not.toHaveBeenCalled()
  })

  it('should not add connection EventEmitter if server is undefined', () => {
    jest.clearAllMocks()
    socket = new Socket()

    expect(mockOnFn).not.toHaveBeenCalled()
  })

  it('should attach the server to socket cluster', () => {
    expect(returnAuthDisabledSpy)
      .toHaveBeenCalled()
  })

  describe('addMiddleware()', () => {
    it('should be instance of onPublish middleware', () => {
      expect(mockOnFn)
        .toBeCalledWith('connection', expect.any(socket.onPublish.constructor))
    })
  })

  describe('onConnection', () => {
    it('should return undefined when there is no socket', () => {
      expect(socket.onConnection()).toBeUndefined()
    })

    it('should return undefined when socket is not bound to server', () => {
      socket = new Socket()
      expect(socket.onConnection(socket)).toBeUndefined()
    })

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

    it('should attach authentication listeners', () => {
      socket.getAuthToken = mockGetAuthToken
      socket.on = mockOnFn
      socket.onConnection(socket)
      expect(authAttachSpy).toHaveBeenCalled()
    })

    it('should attach room listeners', () => {
      socket.getAuthToken = mockGetAuthToken
      socket.on = mockOnFn
      socket.onConnection(socket)
      expect(roomAttachSpy).toHaveBeenCalled()
    })
  })

  describe('onPublish()', () => {
    it('should not call next when next method is missing', () => {
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return next when req data is missing', () => {
      socket.onPublish(null, mockNext)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should call socket.exchange.publish with user auth tokens when req data is valid', () => {
      socket.onPublish(req, mockNext)
      expect(mockSocketExcangePublish)
        .toHaveBeenCalledWith(
          'mockChannel',
          {
            body: {
              users: ["mockAuthToken"]
            },
            type: "userListChange"
          }
        )
    })
  })
})

// Constructor √
// addMiddleware √
// onConnection √
// onPublish √
