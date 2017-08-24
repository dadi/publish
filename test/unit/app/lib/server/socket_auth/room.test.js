const globals = require(`${__dirname}/../../../../../../app/globals`) // Always required
const Room = require(`${__dirname}/../../../../../../app/lib/server/socket_auth/room`)
const Socket = require(`${__dirname}/../../../../../../app/lib/server/socket`)
const scServer = require('socketcluster-server')
const nock = require('nock')
const config = require(paths.config)

let room
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
// let mockGetAuthToken = jest.fn(() => 'mockToken')
// const mockSetAuthToken = jest.fn(() => {})

const mockSocketClients = {
  mockKey1: {
    authToken: { 
      name: 'Foo',
      email: 'foo@somedomain.com',
      handle: 'foo',
      username: 'foo' 
    },
    channelSubscriptions: { room1: true }
  },
  mockKey2: {
    authToken: { 
      name: 'Bar',
      email: 'bar@somedomain.com',
      handle: 'bar',
      username: 'bar' 
    },
    channelSubscriptions: { room2: true }
  },
  mockKey3: {
    authToken: { 
      name: 'Baz',
      email: 'baz@somedomain.com',
      handle: 'baz',
      username: 'baz' 
    },
    channelSubscriptions: { room1: true }
  }
}

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

jest.mock(`${__dirname}/../../../../../../app/lib/server/socket`, () => {
  return () => {

  }
})

beforeEach(() => {
  server = nock('http://127.0.0.1')
  socket = new Socket(server)

  // Clear mocks
  // mockGetAuthToken.mockClear()
  // mockSetAuthToken.mockClear()
  mockOnFn.mockClear()

  // socket.getAuthToken = mockGetAuthToken
  // socket.setAuthToken = mockSetAuthToken
  socket.on = mockOnFn
  // socketServer = scServer.attach(server)
  room = new Room()
})

describe('Room', () => {
  it('should export function', () => {
    expect(room).toBeInstanceOf(Object)
  })

  describe(`attach()`, () => {
    it('should return undefined if socket or scServer are undefined', () => {
      expect(room.attach())
        .toBeUndefined()
    })

    it('should store a reference to socket at module instance level', () => {
      room.attach(socket)

      expect(room.socket)
        .toBeInstanceOf(socket.constructor)
    })

    it('should add login and disconnect listener to the socket', () => {
      room.attach(socket)

      expect(mockOnFn)
        .toHaveBeenCalledTimes(2)
    })
  })

  describe('getUsers()', () => {
    it('should get all users in a given room', () => {
      expect(room.getUsers('room1', mockSocketClients))
        .toHaveLength(2)
    })

    it('should return user authToken objects matching room filter', () => {
      expect(room.getUsers('room1', mockSocketClients))
        .toEqual(expect.arrayContaining([
          expect.objectContaining({ 
            name: 'Foo',
            email: 'foo@somedomain.com',
            handle: 'foo',
            username: 'foo' 
          }),
          expect.objectContaining({ 
            name: 'Baz',
            email: 'baz@somedomain.com',
            handle: 'baz',
            username: 'baz' 
          })
        ]))
    })

    it('should return an empty array if room is invalid type', () => {
      expect(room.getUsers(undefined, mockSocketClients))
        .toHaveLength(0)
    })

    it('should return an empty array if clients is invalid type', () => {
      expect(room.getUsers('room1', undefined))
        .toHaveLength(0)
    })
  })

  describe('userListDidChange()', () => {
    
  })
})

// attach √
// userListDidChange
// getUsers √