const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const ApiBridge = require(`${__dirname}/../../../../app/lib/controllers/api-bridge`).APIBridgeController

const httpMocks = require('node-mocks-http')

let apiBridge
let req
let res

const headers = {
  'content-type': 'application/json',
  'content-length': '100'
}

beforeEach(() => {
  req = httpMocks.createRequest()
  res = httpMocks.createResponse({
    req,
    eventEmitter: require('events').EventEmitter
  })
  apiBridge = new ApiBridge()
})

describe('ApiBridge', () => {
  it('should export function', () => {
    expect(apiBridge).toBeInstanceOf(Object)
  })

  describe('ApiBridge: POST without application/json content-type', () => {
    it('should return next', () => {
      expect(apiBridge.post(req, res, () => true)).toBe(true)
    })
  })

  describe('ApiBridge: POST Correct response code', () => {
    it('should return next', (done) => {
      req = httpMocks.createRequest({
        headers,
        method: 'POST'
      }) 
      res.on('end', () => {
        expect(res.statusCode).toBe(200)
        done()
      })
      apiBridge.post(req, res, () => {})
    })
  })

  describe('ApiBridge: POST empty bundle query', () => {
    it('should return next', (done) => {
      req = httpMocks.createRequest({
        headers,
        method: 'POST'
      }) 
      res.on('end', () => {
        expect(res._getData()).toBe('')
        done()
      })
      apiBridge.post(req, res, () => {})
    })
  })
})

