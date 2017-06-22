const Constants = require(`${__dirname}/../../../../app/lib/constants`)
const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Session = require(`${__dirname}/../../../../app/lib/controllers/session`).Session
const httpMocks = require('node-mocks-http')
const nock = require('nock')
const config = require(paths.config)

let session
let req
let res

const headers = {
  'content-type': 'application/json',
  'content-length': '100'
}

const auth = config.get('auth')

beforeEach(() => {
  session = new Session()
  req = httpMocks.createRequest()
  res = httpMocks.createResponse({
    eventEmitter: require('events').EventEmitter
  })
})

describe('Session', () => {
  it('should export function', () => {
    expect(session).toBeInstanceOf(Object)
  })

  describe(`GET with auth disabled`, () => {
    it('should return 200 status code', (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(res.statusCode).toBe(200)
        done()
      })
      session.get(req, res, () => true)
    })

    it(`should return ${Constants.AUTH_DISABLED} error`, (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(res._getData()).toBe(`{"error":"${Constants.AUTH_DISABLED}"}`)
        done()
      })
      session.get(req, res, () => true)
    })
  })

  describe(`reset with auth disabled`, () => {
    it('should return 200 status code', (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(res.statusCode).toBe(200)
        done()
      })
      session.reset(req, res, () => true)
    })

    it(`should return ${Constants.AUTH_DISABLED} error`, (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(res._getData()).toBe(`{"error":"${Constants.AUTH_DISABLED}"}`)
        done()
      })
      session.reset(req, res, () => true)
    })
  })

  describe(`resetToken with auth disabled`, () => {
    it('should return 200 status code', (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(res.statusCode).toBe(200)
        done()
      })
      session.resetToken(req, res, () => true)
    })

    it(`should return ${Constants.AUTH_DISABLED} error`, (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(res._getData()).toBe(`{"error":"${Constants.AUTH_DISABLED}"}`)
        done()
      })
      session.resetToken(req, res, () => true)
    })
  })
})

// Authorise
// Delete
// Get
// Post
// Put
// Reset
// resetToken
