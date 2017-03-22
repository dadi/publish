'use strict'
const path = require('path')

module.exports = {
  app: {
    availableInFrontend: true,
    name: {
      doc: 'The applicaton name',
      format: String,
      default: 'DADI Publish (Repo Default)'
    },
    publisher: {
      doc: 'The organisation name',
      format: String,
      default: 'DADI'
    },
    baseUrl: {
      doc: 'The base URL of the application',
      format: 'url',
      default: 'http://localhost:3001'
    }
  },
  apis: {
    availableInFrontend: true,
    doc: 'Connected APIs',
    format: Array,
    default: [],
    _publishId: {
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
  },
  auth: {
    doc: 'Auth API Collection',
    availableInFrontend: true,
    format: Object,
    default: {
      enabled: false
    },
    enabled: {
      availableInFrontend: true,
      format: Boolean,
      default: true
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
    collection: {
      availableInFrontend: true,
      format: String,
      default: ''
    },
    version: {
      availableInFrontend: true,
      format: String,
      default: '1.0'
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
  },
  assets: {
    doc: 'Asset API Endpoint',
    format: Object,
    default: {
      enabled: true
    },
    enabled: {
      format: Boolean,
      default: true
    },
    name: {
      format: String,
      default: 'No Name'
    },
    host: {
      format: 'ipaddress',
      default: '0.0.0.0'
    },
    port: {
      format: 'port',
      default: 3000
    },
    endpoint: {
      format: String,
      default: ''
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
  },
  server: {
    availableInFrontend: true,
    host: {
      availableInFrontend: true,
      doc: 'The IP address or interface to bind to',
      format: 'ipaddress',
      default: '0.0.0.0'
    },
    port: {
      availableInFrontend: true,
      doc: 'The port to bind to',
      format: 'port',
      default: 3001
    },
    protocol: {
      doc: 'The protocol the web application will use',
      format: String,
      default: 'http',
      env: 'PROTOCOL'
    },
    sslPassphrase: {
      doc: 'The passphrase of the SSL private key',
      format: String,
      default: '',
      env: 'SSL_PRIVATE_KEY_PASSPHRASE'
    },
    sslPrivateKeyPath: {
      doc: 'The filename of the SSL private key',
      format: String,
      default: '',
      env: 'SSL_PRIVATE_KEY_PATH'
    },
    sslCertificatePath: {
      doc: 'The filename of the SSL certificate',
      format: String,
      default: '',
      env: 'SSL_CERTIFICATE_PATH'
    },
    sslIntermediateCertificatePath: {
      doc: 'The filename of an SSL intermediate certificate, if any',
      format: String,
      default: '',
      env: 'SSL_INTERMEDIATE_CERTIFICATE_PATH'
    },
    sslIntermediateCertificatePaths: {
      doc: 'The filenames of SSL intermediate certificates, overrides sslIntermediateCertificate (singular)',
      format: Array,
      default: [],
      env: 'SSL_INTERMEDIATE_CERTIFICATE_PATHS'
    },
    authenticate: {
      availableInFrontend: true,
      doc: 'Enabled authentication layer',
      format: Boolean,
      default: true
    }
  },
  paths: {
    doc: 'Customisable asset paths',
    format: Object,
    default: {
      language: path.join(__dirname, '/../language'),
      workspace: path.join(__dirname, '/../workspace'),
      db: path.join(__dirname, '/../workspace/db')
    }
  },
  TZ: {
    availableInFrontend: true,
    doc: 'Process Timezone',
    default: 'Europe/London'
  },
  env: {
    availableInFrontend: true,
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  ui: {
    availableInFrontend: true,
    inputDelay: {
      doc: 'Delay in ms to debounce inputs by',
      format: 'integer',
      default: 100
    }
  }
}
