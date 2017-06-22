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

const wrapperResponse =  { 
  options: {
    appId: 'DADI Publish',
    uri: 'http://127.0.0.1',
    port: 80,
    credentials: { 
      clientId: 'testClient', 
      clientSecret: 'superSecret'
    },
    version: '1.0',
    database: 'test',
    tokenUrl: '/token'
  },
  passportOptions: {
  issuer: {
      uri: 'http://127.0.0.1', 
      port: 80, 
      endpoint: '/token'
    },
    credentials: {
      clientId: 'testClient', clientSecret: 'superSecret'
    },
    wallet: 'file',
    walletOptions: {
      path: '/data/app/publish/node_modules/@dadi/api-wrapper/.wallet/token.http-12700180.testclient.json'
    }
  }
}

describe('API', () => {
  it('should export function', () => {
    expect(new Api()).toBeInstanceOf(Object)
  })

  describe('API with no options', () => {
    it('should return undefined', () => {
      expect(Api()).toBeUndefined()
    })
  })

  describe('API with options', () => {
    it('should return API wrapper object', () => {
      expect(JSON.stringify(Api(options))).toBe(JSON.stringify(wrapperResponse))
    })
  })
})
