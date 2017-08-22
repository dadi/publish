const Constants = require(`${__dirname}/../../../../app/lib/constants`)
const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Session = require(`${__dirname}/../../../../app/lib/controllers/session`).Session
const httpMocks = require('node-mocks-http')
const DadiAPI = require('@dadi/api-wrapper')
const nock = require('nock')
const config = require(paths.config)

let session
let req
let res

const headers = {
  'content-type': 'application/json',
  'content-length': '100'
}

const next = jest.fn(() => {
  return true
})

const auth = config.get('auth')

beforeEach(() => {
  // next.mockClear()
  config.set('auth.enabled', true)
  session = new Session()
  req = httpMocks.createRequest()
  res = httpMocks.createResponse({
    eventEmitter: require('events').EventEmitter
  })
  req.session = {
    passport: {
      user: {
        username: 'foo',
        email: 'foo@somedomain.com'
      }
    }
  }
  req.isAuthenticated = jest.fn(() => {
    return true
  })
})

describe('Session', () => {
  it('should export function', () => {
    expect(session).toBeInstanceOf(Object)
  })

  describe(`get()`, () => {
    it('should return 503 status code when auth is disabled', (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(res.statusCode).toBe(503)
        done()
      })
      session.get(req, res, next)
    })

    it(`should return ${Constants.AUTH_DISABLED} error`, (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {

        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
          error: Constants.AUTH_DISABLED
        }))
        done()
      })
      session.get(req, res, next)
    })

    it('should return session data if user is authenticated', (done) => {
      res.on('end', () => {
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
          email: expect.any(String),
          username: expect.any(String)
        }))
        done()
      })
      session.get(req, res, next)
    })

    it('should return 401 when isAuthenticated returns false', (done) => {
      req.isAuthenticated = jest.fn(() => {
        return false
      })

      res.on('end', () => {
        expect(res.statusCode).toBe(401)
        done()
      })

      session.get(req, res, next)
    })
  })

  describe(`reset()`, () => {
    it('should return 503 status code when auth is disabled', (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(res.statusCode).toBe(503)
        done()
      })
      session.reset(req, res, next)
    })

    it(`should return ${Constants.AUTH_DISABLED} error when auth is disabled`, (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
          error: Constants.AUTH_DISABLED
        }))
        done()
      })
      session.reset(req, res, next)
    })

    it(`should return ${Constants.PASSWORD_RESET_INVALID} error if token and password are invalid`, (done) => {
      res.on('end', () => {
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
          error: Constants.PASSWORD_RESET_INVALID
        }))
        done()
      })
      session.reset(req, res, next)
    })

    it(`should return success if API returns results`, (done) => {
      req.body = {
        token: 'mockToken',
        password: 'mockPassword'
      }

      DadiAPI.APIWrapper.prototype.update = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          resolve({
            results: [{}]
          })
        })  
      })

      res.on('end', () => {
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
          success: true
        }))
        done()
      })
      session.reset(req, res, next)
    })

    it(`should return error ${Constants.PASSWORD_RESET_FAILED} if API returns empty results`, (done) => {
      req.body = {
        token: 'mockToken',
        password: 'mockPassword'
      }

      DadiAPI.APIWrapper.prototype.update = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          resolve({
            results: []
          })
        })  
      })

      res.on('end', () => {
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
          error: Constants.PASSWORD_RESET_FAILED
        }))
        done()
      })
      session.reset(req, res, next)
    })
  })

  describe(`resetToken()`, () => {
    it('should return 503 status code when auth is disabled', (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(res.statusCode).toBe(503)
        done()
      })
      session.resetToken(req, res, next)
    })

    it(`should return ${Constants.AUTH_DISABLED} error when auth is disabled`, (done) => {
      config.set('auth.enabled', false)
      res.on('end', () => {
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
          error: Constants.AUTH_DISABLED
        }))
        done()
      })
      session.resetToken(req, res, next)
    })

    it(`should return ${Constants.INVALID_EMAIL} error when address is missing from body`, (done) => {
      config.set('auth.enabled', true)

      res.on('end', () => {
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
          error: Constants.INVALID_EMAIL
        }))

        done()
      })
      session.resetToken(req, res, next)
    })

    it(`should return valid expiry object.`, (done) => {
      config.set('auth.enabled', true)
      req.body = {
        email: 'foo@somedomain.com'
      }
      
      res.on('end', () => {
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({
          expiresAt: expect.any(Number)
        }))
        done()
      })
      session.resetToken(req, res, () => true)
    })
  })
})

/**
 * TO-DO
 * authorise
 * delete
 * get √
 * post
 * put
 * reset
 * resetToken √
 */
