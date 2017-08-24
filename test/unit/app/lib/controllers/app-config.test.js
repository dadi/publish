const globals = require(`${__dirname}/../../../../../app/globals`) // Always required
const AppConfigController = require(`${__dirname}/../../../../../app/lib/controllers/app-config`)
const httpMocks = require('node-mocks-http')
const config = require(paths.config)

let appConfig
let req
let res

const expectedConfig = {
  app: {
    availableInFrontend: true,
    name: 'DADI Publish Test',
    publisher: 'DADI',
    baseUrl: 'http://0.0.0.0'
  },
  apis:[{ 
    publishId: null,
    name: 'Demo API',
    host: 'http://0.0.0.0',
    port: 3001,
    database: 'publish',
    version: '1.0',
    menu: null 
  }],
  auth:{
    enabled: true,
    host: 'http://0.0.0.0',
    port: 3001,
    database: 'publish',
    collection: 'users',
    version: '1.0' 
  },
  server: {
    host: '0.0.0.0', 
    port: 443,
    healthcheck: {
      enabled: true,
      frequency: 2000
    }
  },
  formats:{
    availableInFrontend: true,
    date: {
      long: 'YYYY/MM/DD HH:mm' 
    }
  },
  ga: {
    enabled: false,
    trackingId: ''
  },
  TZ: 'Europe/London',
  env: 'test',
  ui: { availableInFrontend: true, inputDelay: 100 },
  FieldImage: {
    accept: [ 'image/*' ],
    cdn: { 
      enabled: false, 
      host: '0.0.0.0', 
      path: '', 
      port: 3000
    }
  }
}

const headers = {
  'content-type': 'application/json',
  'content-length': '100'
}

beforeEach(() => {
  appConfig = new AppConfigController()
  req = httpMocks.createRequest({headers})
  res = httpMocks.createResponse({
    eventEmitter: require('events').EventEmitter
  })
})

describe('App config', () => {
  it('should export function', () => {
    expect(appConfig).toBeInstanceOf(Object)
  })

  describe('GET with no application/json content-type header', () => {
    it ('should return 200 status code', (done) => {
      req = httpMocks.createRequest()
      res.on('end', () => {
        expect(res.statusCode).toBe(200)
        done()
      })
      appConfig.get(req, res, () => true)
    })

    it ('should return empty result', (done) => {
      req = httpMocks.createRequest()
      res.on('end', () => {
        expect(res._getData()).toBe('')
        done()
      })
      appConfig.get(req, res, () => true)
    })
  })

  describe('GET config', () => {
    it ('should return filtered config body', (done) => {
      res.on('end', () => {
        expect(res._getData()).toBe(JSON.stringify(expectedConfig))
        done()
      })
      appConfig.get(req, res, () => true)
    })
  })

  describe('Assign', () => {
    it('should return config filtered by availableInFrontend.', () => {
      config.set('availableInFrontend', {ui: true})

      const frontendConfig = AppConfigController.assign(config.get('availableInFrontend'))
      expect(frontendConfig)
        .toEqual(expect.objectContaining({
          ui: expect.objectContaining({
            availableInFrontend: expect.any(Boolean),
            inputDelay: expect.any(Number)
          })
        }))
    })
  })
})
