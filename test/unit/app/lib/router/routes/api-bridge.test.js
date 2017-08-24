const globals = require(`${__dirname}/../../../../../../app/globals`) // Always required
const APIBridgeRoutes = require(`${__dirname}/../../../../../../app/lib/router/routes/api-bridge`)
const nock = require('nock')
const restify = require('restify')

let server
const restifySpy = jest.spyOn(restify, 'throttle')
const mockUse = jest.fn()

beforeEach(() => {
  mockUse.mockReset()
  restifySpy.mockReset()
  server = nock('http://127.0.0.1')
  server.use = mockUse
})

describe('Router', () => {
  it('should export object', () => {
    expect(new APIBridgeRoutes(server)).toBeInstanceOf(Object)
  })

  it('should exit if server is undefined', () => {
    const sessionRouteInstance = new APIBridgeRoutes()
    expect(sessionRouteInstance).toEqual({})
  })

  it('should exit if server is undefined', () => {
    new APIBridgeRoutes(server)
    expect(restifySpy)
      .toHaveBeenCalled()
  })
})