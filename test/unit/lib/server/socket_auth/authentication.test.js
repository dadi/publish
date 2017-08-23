const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const Auth = require(`${__dirname}/../../../../../app/lib/server/socket_auth/authentication`)
const Socket = require(`${__dirname}/../../../../../app/lib/server/socket`)
const scServer = require('socketcluster-server')
const nock = require('nock')
const config = require(paths.config)

let auth
let server
let socketServer
let socket

const mockData = {
  user: {
    email: 'foo@somedomain.com',
    first_name: 'Foo',
    last_name: 'Bar',
    handle: 'foo-bar',
    _id: 'mockId'
  }
}
const mockOnFn = jest.fn((type, callback) => {})
const mockNext = jest.fn((res, error) => {})
let mockGetAuthToken = jest.fn(() => 'mockToken')
const mockSetAuthToken = jest.fn(() => {})

jest.mock('socketcluster-server', () => {
  return {
    attach: jest.fn((app) => {
      return {
        MIDDLEWARE_PUBLISH_IN: 'publishIn',
        on: mockOnFn
      }
    })
  }
})

jest.mock(`${__dirname}/../../../../../app/lib/server/socket`, () => {
  return () => {

  }
})

beforeEach(() => {
  server = nock('http://127.0.0.1')
  socket = new Socket(server)

  // Clear mocks
  mockGetAuthToken.mockClear()
  mockSetAuthToken.mockClear()
  mockOnFn.mockClear()

  socket.getAuthToken = mockGetAuthToken
  socket.setAuthToken = mockSetAuthToken
  socket.on = mockOnFn
  socketServer = scServer.attach(server)
  auth = new Auth()
})

describe('Auth', () => {
  it('should export function', () => {
    expect(auth).toBeInstanceOf(Object)
  })

  describe(`attach()`, () => {
    it('should return undefined if socket or scServer are undefined', () => {
      expect(auth.attach())
        .toBeUndefined()
    })

    it('should store a reference to socket at module instance level', () => {
      auth.attach(socket)

      expect(auth.socket)
        .toBeInstanceOf(socket.constructor)
    })

    it('should refresh the auth token if it exists', () => {
      auth.attach(socket)

      expect(mockSetAuthToken)
        .toHaveBeenCalledWith('mockToken', expect.any(Object))
    })

    it('should not refresh the auth token if it this is a new', () => {
      mockGetAuthToken = jest.fn(() => {})
      auth.attach(socket)

      expect(mockSetAuthToken)
        .not.toHaveBeenCalledWith('mockToken')
    })

    it('should add login and disconnect listener to the socket', () => {
      auth.attach(socket)

      expect(mockOnFn)
        .toHaveBeenCalledTimes(2)
    })
  })

  describe(`validateLogin()`, () => {
    it('should return callback if user block is invalid', () => {
      auth.attach(socket)
      auth.validateLogin(null, mockNext)

      expect(mockNext)
        .toHaveBeenCalledWith(null, 'Invalid user')
    })

    it('should return an error if the socket is invalid', () => {
      auth.validateLogin(mockData, mockNext)

      expect(mockNext)
        .toHaveBeenCalledWith(null, 'Invalid socket')
    })
  })
})