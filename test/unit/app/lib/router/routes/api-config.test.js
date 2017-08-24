const globals = require(`${__dirname}/../../../../../../app/globals`) // Always required
const AppConfigRoutes = require(`${__dirname}/../../../../../../app/lib/router/routes/app-config`)
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
    expect(new AppConfigRoutes(server)).toBeInstanceOf(Object)
  })

  it('should exit if server is undefined', () => {
    const sessionRouteInstance = new AppConfigRoutes()
    expect(sessionRouteInstance).toEqual({})
  })
})