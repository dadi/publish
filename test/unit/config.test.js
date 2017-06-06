const globals = require(`${__dirname}/../../app/globals`) // Always required
const config = require(`${__dirname}/../../app/config`)

describe('Config', () => {
  it('should export object', () => {
    expect(config).toBeInstanceOf(Object)
  })
  describe('#getFrontendProps()', () => {
    const input = {
      apis: {
        availableInFrontend: true,
        doc: 'Connected APIs',
        format: Array,
        default: [],
        publishId: {
          availableInFrontend: true,
          type: String,
          default: ''
        },
        enabled: {
          type: Boolean,
          default: true
        },
        name: {
          availableInFrontend: true,
          format: String,
          default: 'No Name'
        },
        host: {
          availableInFrontend: true,
          format: 'ipaddress',
          default: '0.0.0.0'
        },
        port: {
          availableInFrontend: true,
          format: 'port',
          default: 3000
        },
        database: {
          availableInFrontend: true,
          format: String,
          default: ''
        },
        version: {
          availableInFrontend: true,
          format: String,
          default: '1.0'
        },
        menu: {
          availableInFrontend: true,
          doc: 'Collection menu ordering and grouping',
          format: Array,
          default: []
        },
        credentials: {
          format: Object,
          clientId: {
            format: String,
            default: 'testClient'
          },
          secret: {
            format: String,
            default: 'superSecret'
          }
        }
      }
    }
    const out = {
      apis: {
        publishId: true,
        name: true,
        host: true,
        port: true,
        database: true,
        version: true,
        menu: true
      } 
    }
    it('should return object', () => {
      expect(config.getFrontendProps()).toBeInstanceOf(Object)
    })
    // Create schema instance for all three tests
    const schema = config.getFrontendProps(input, {})

    it('should return only input props with true "availableInFrontend" key', () => {
      expect(schema).toMatchObject(out)
    })
    it('should return nested values', () => {
      expect(schema).toHaveProperty('apis.publishId')
      expect(schema).toHaveProperty('apis.name')
      expect(schema).toHaveProperty('apis.host')
      expect(schema).toHaveProperty('apis.port')
      expect(schema).toHaveProperty('apis.database')
      expect(schema).toHaveProperty('apis.version')
      expect(schema).toHaveProperty('apis.menu')
    })
    it('should filter hidden nested values', () => {
      expect(schema).not.toHaveProperty('apis.enabled')
      expect(schema).not.toHaveProperty('apis.credentials')
      expect(schema).not.toHaveProperty('apis.credentials.clientId')
      expect(schema).not.toHaveProperty('apis.credentials.secret')
    })
  })
})