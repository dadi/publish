const globals = require(`${__dirname}/../../../../app/globals`) // Always required
const Api = require(`${__dirname}/../../../../app/lib/models/api`).Api
const config = require(paths.config)

const options = {
  host: 'http://127.0.0.1',
  port: 80,
  credentials: {
    clientId: 'testClient',
    clientSecret: 'superSecret'
  },
  version: '1.0',
  database: 'test'
}

describe('API', () => {
  it('should export function', () => {
    expect(new Api(options).options).toBeInstanceOf(Object)
  })

  describe('API with no options', () => {
    it('should return undefined', () => {
      expect(new Api().options).toBeUndefined()
    })
  })

  describe('API with options', () => {
    it('should return API wrapper object', () => {

      const apiInstance = new Api(options)
      
      expect(apiInstance).toHaveProperty('options')
      expect(apiInstance).toHaveProperty('options.appId')
      expect(apiInstance).toHaveProperty('options.uri')
      expect(apiInstance).toHaveProperty('options.port')
      expect(apiInstance).toHaveProperty('options.credentials')
      expect(apiInstance).toHaveProperty('options.credentials.clientId')
      expect(apiInstance).toHaveProperty('options.credentials.clientSecret')
      expect(apiInstance).toHaveProperty('options.version')
      expect(apiInstance).toHaveProperty('options.database')
      expect(apiInstance).toHaveProperty('options.tokenUrl')
      expect(apiInstance).toHaveProperty('passportOptions')
      expect(apiInstance).toHaveProperty('passportOptions.issuer')
      expect(apiInstance).toHaveProperty('passportOptions.issuer.uri')
      expect(apiInstance).toHaveProperty('passportOptions.issuer.port')
      expect(apiInstance).toHaveProperty('passportOptions.issuer.endpoint')
      expect(apiInstance).toHaveProperty('passportOptions.credentials')
      expect(apiInstance).toHaveProperty('passportOptions.credentials.clientId')
      expect(apiInstance).toHaveProperty('passportOptions.credentials.clientSecret')
      expect(apiInstance).toHaveProperty('passportOptions.wallet')
    })
  })
})
