const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const ApiBridge = require(`${__dirname}/../../../../app/lib/controllers/api-bridge`).APIBridgeController
const config = require(paths.config)

const httpMocks = require('node-mocks-http')

let apiBridge
let req
let res

const headers = {
  'content-type': 'application/json',
  'content-length': '100'
}

beforeEach(() => {
  req = httpMocks.createRequest({
    headers,
    method: 'POST'
  })
  res = httpMocks.createResponse({
    req,
    eventEmitter: require('events').EventEmitter
  })
  req.isAuthenticated = () => true
  apiBridge = new ApiBridge()
})

describe('ApiBridge', () => {
  it('should export function', () => {
    expect(apiBridge).toBeInstanceOf(Object)
  })

  describe('ApiBridge: POST without application/json content-type', () => {
    it('should return next', () => {
      req = httpMocks.createRequest()
      expect(apiBridge.post(req, res, () => true)).toBe(true)
    })
  })

  describe('ApiBridge: POST Correct response code with authenticated empty request', () => {
    it('should return 500 response code', (done) => {
      res.on('end', () => {
        expect(res.statusCode).toBe(500)
        done()
      })
      apiBridge.post(req, res, () => {})
    })

    describe('ApiBridge: POST 200 response code with APIs', () => {
      it('should return 200 response code', (done) => {
        config.set('apis', [])
        res.on('end', () => {
          expect(res.statusCode).toBe(200)
          done()
        })
        apiBridge.post(req, res, () => {})
      })
    })

    describe('ApiBridge: POST empty bundle query with authenticated request', () => {
      it('should return next', (done) => {
        res.on('end', () => {
          expect(res._getData()).toBe('')
          done()
        })
        apiBridge.post(req, res, () => {})
      })
    })

    describe('ApiBridge: POST return without APIs', () => {
      it('should return undefined', () => {
        config.set('apis', [])
        expect(apiBridge.post(req, res, () => true)).toBe(true)
      })
    })
  })

  describe('ApiBridge: POST 200 response code with unauthenticated empty request', () => {
    it('should return 200 response code', (done) => {
      req.isAuthenticated = () => false
      res.on('end', () => {
        expect(res.statusCode).toBe(200)
        done()
      })
      apiBridge.post(req, res, () => {})
    })

    describe('ApiBridge: POST AUTH_FAILED error with unauthenticated empty request', () => {
      it('should return next', (done) => {
        req.isAuthenticated = () => false
        res.on('end', () => {
          expect(res._getData()).toBe('{"err":"AUTH_FAILED"}')
          done()
        })
        apiBridge.post(req, res, () => {})
      })
    })
  })
})
