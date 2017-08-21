const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const ApiBridge = require(`${__dirname}/../../../../app/lib/controllers/api-bridge`).APIBridgeController

const httpMocks = require('node-mocks-http')
const nock = require('nock')
const config = require(paths.config)
const mockRequest = require('request-promise')

jest.mock('@dadi/passport', () => {
  return () => mockRequest
})

const publishId = 'foobar'
let apiBridge
let req
let res
let body
const apis = config.get('apis')

const headers = {
  'content-type': 'application/json',
  'content-length': '100'
}

beforeEach(() => {
  config.set('apis', apis)
  req = httpMocks.createRequest({
    headers,
    method: 'POST'
  })
  req.isAuthenticated = () => true

  res = httpMocks.createResponse({
    eventEmitter: require('events').EventEmitter
  })
  if (config.get('apis').length) {
    const apiConfig = config.get('apis')[0]
    body = [{
      method: 'GET',
      uri: {
        href: `${apiConfig.host}:${apiConfig.port}/${apiConfig.version}/${apiConfig.database}/foo`,
        hostname: `${apiConfig.host.replace(/(^\w+:|^)\/\//, '')}`,
        path: `/${apiConfig.version}/${apiConfig.database}/foo`,
        port: apiConfig.port,
        protocol: 'http:' 
      }//,
      //publishId: publishId
    }]
    const server = nock(`${apiConfig.host}:${apiConfig.port}`)
      .post(`/${apiConfig.version}/${apiConfig.database}/foo`)
      .reply(200, [{ 
        results:[{}],
        metadata:{
          limit: 20,
          page: 1,
          fields: {},
          sort: {},
          offset: 0,
          totalCount: 25,
          totalPages: 2,
          nextPage: 2
        }
      }])
      .post('/token')
      .reply(200, {
        accessToken: "d08c2efb-c0d6-446a-ba84-4a4199c9e0c5",
        tokenType: "Bearer",
        expiresIn: 1800
      })
  }
  apiBridge = new ApiBridge()
})

afterEach(() => {
  config.set('apis', [])
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

  describe('ApiBridge: POST unauthenticated empty request', () => {
    it('should return 200 response code', (done) => {
      req.isAuthenticated = () => false
      res.on('end', () => {
        expect(res.statusCode).toBe(200)
        done()
      })
      apiBridge.post(req, res, () => {})
    })

    it('should return next', (done) => {
      req.isAuthenticated = () => false
      res.on('end', () => {
        expect(res._getData()).toBe('{"err":"AUTH_FAILED"}')
        done()
      })
      apiBridge.post(req, res, () => {})
    })
  })

  describe('ApiBridge: POST Correct response code with authenticated empty request', () => {
    it('should return 200 response code', (done) => {
      res.on('end', () => {
        expect(res.statusCode).toBe(200)
        done()
      })
      apiBridge.post(req, res, () => {})
    })

    describe('ApiBridge: POST 200 response code without APIs', () => {
      it('should return 200 response code', (done) => {
        res.on('end', () => {
          expect(res.statusCode).toBe(200)
          done()
        })
        apiBridge.post(req, res, () => {})
      })

      it('should return undefined', () => {
        expect(apiBridge.post(req, res, () => true)).toBe(true)
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

  })

  describe('ApiBridge: POST Correct response code with authenticated populated request', () => {
    it('should return 500 response code', (done) => {
      req = httpMocks.createRequest({
        headers,
        method: 'POST',
        body
      })
      req.isAuthenticated = () => true
      res.on('end', () => {
        expect(res.statusCode).toBe(500)
        done()
      })
      apiBridge.post(req, res, () => {})
    })
  })

})
