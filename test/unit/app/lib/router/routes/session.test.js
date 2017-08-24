const globals = require(`${__dirname}/../../../../../../app/globals`) // Always required
const SessionRoutes = require(`${__dirname}/../../../../../../app/lib/router/routes/session`)
const SessionController = require(`${__dirname}/../../../../../../app/lib/controllers/session`)
const nock = require('nock')

let server
beforeEach(() => {

  server = nock('http://127.0.0.1')
  server.constructor.prototype.del = server.constructor.prototype.delete
})

afterEach(() => {

})

describe('Router', () => {
  it('should export object', () => {
    expect(new SessionRoutes(server)).toBeInstanceOf(Object)
  })

  it('should exit if server is undefined', () => {
    const sessionRouteInstance = new SessionRoutes()
    expect(sessionRouteInstance).toEqual({})
  })

  it('should add all routes', () => {
    new SessionRoutes(server)
    const expectedPostInterceptors = [
      expect.objectContaining({
        method: 'POST'
      }),
      expect.objectContaining({
        method: 'GET'
      }),
      expect.objectContaining({
        method: 'PUT'
      }),
      expect.objectContaining({
        method: 'DELETE'
      })
    ]

    expect(server.interceptors)
      .toEqual(expect.arrayContaining(expectedPostInterceptors))
  })
})