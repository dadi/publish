module.exports = {
  auth: {
    doc: 'Auth API Collection',
    format: Object,
    default: {
      enabled: false
    },
    collection: {
      format: String,
      default: ''
    },
    database: {
      format: String,
      default: ''
    },
    enabled: {
      format: Boolean,
      default: true
    },
    host: {
      format: 'ipaddress',
      default: '0.0.0.0'
    },
    port: {
      format: 'port',
      default: 3000
    },
    version: {
      format: String,
      default: '1.0'
    }
  },
  apis: {
    requireAuthentication: false,
    doc: 'Connected APIs',
    format: Array,
    default: [],
    publishId: {
      type: String,
      default: ''
    },
    enabled: {
      type: Boolean,
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
    database: {
      format: String,
      default: ''
    },
    version: {
      format: String,
      default: '1.0'
    },
    menu: {
      doc: 'Collection menu ordering and grouping',
      format: Array,
      default: []
    }
  },
  app: {
    name: {
      doc: 'The applicaton name',
      format: String,
      default: 'DADI Publish (Repo Default)'
    },
    publisher: {
      doc: 'The organisation name',
      format: String,
      default: 'DADI'
    }
  },
  cdn: {
    publicUrl: {
      doc: 'The host of the URL where the CDN instance can be publicly reached',
      format: '*',
      default: null
    }
  },
  env: {
    doc: 'The applicaton environment.',
    format: String,
    default: 'development',
    env: 'NODE_ENV'
  },
  formats: {
    date: {
      long: {
        doc: 'Date Format',
        format: String,
        default: 'YYYY/MM/DD HH:mm'
      },
      short: {
        doc: 'Date Format',
        format: String,
        default: 'YYYY/MM/DD'
      }
    }
  },
  ga: {
    doc: 'Google Analytics options',
    enabled: {
      doc: 'GA events enabled',
      format: Boolean,
      default: false
    },
    trackingId: {
      doc: 'GA Tracking credentials',
      format: String,
      default: ''
    }
  },
  publicUrl: {
    host: {
      doc: 'The host of the URL where the Publish instance can be publicly reached',
      format: '*',
      default: null,
      env: 'URL_HOST'
    },
    port: {
      doc: 'The port of the URL where the Publish instance can be publicly reached',
      format: '*',
      default: null,
      env: 'URL_PORT'
    },
    protocol: {
      doc: 'The protocol of the URL where the Publish instance can be publicly reached',
      format: 'String',
      default: 'http',
      env: 'URL_PROTOCOL'
    }
  },
  server: {
    requireAuthentication: false,
    host: {
      doc: 'The IP address or interface to bind to',
      format: 'ipaddress',
      default: '0.0.0.0'
    },
    port: {
      doc: 'The port to bind to',
      format: 'port',
      default: 3001
    },
    protocol: {
      doc: 'The protocol the application will use',
      format: String,
      default: 'http',
      env: 'PROTOCOL'
    },
    redirectPort: {
      doc: 'Port from which to redirect HTTP connections to HTTPS',
      format: 'port',
      default: 0
    },
    sslPrivateKeyPath: {
      doc: 'The path to a SSL private key',
      format: String,
      default: '',
      env: 'SSL_PRIVATE_KEY_PATH'
    },
    sslCertificatePath: {
      doc: 'The path to a SSL certificate',
      format: String,
      default: '',
      env: 'SSL_CERTIFICATE_PATH'
    },
    sslPassphrase: {
      doc: 'The passphrase of the SSL private key',
      format: String,
      default: '',
      env: 'SSL_PRIVATE_KEY_PASSPHRASE'
    },
    sslIntermediateCertificatePath: {
      doc: 'The path to a SSL intermediate certificate, if any',
      format: String,
      default: '',
      env: 'SSL_INTERMEDIATE_CERTIFICATE_PATH'
    },
    sslIntermediateCertificatePaths: {
      doc: 'The paths to SSL intermediate certificates, overrides sslIntermediateCertificate (singular)',
      format: Array,
      default: [],
      env: 'SSL_INTERMEDIATE_CERTIFICATE_PATHS'
    },
    healthcheck: {
      enabled: {
        doc: 'Healthcheck is enabled',
        format: Boolean,
        default: true
      },
      frequency: {
        doc: 'Interval between health checks, in milliseconds',
        format: function check (val) {
          if (isNaN(val)) {
            throw new Error('Healthcheck frequency must be a valid number and greater than 1000')
          }

          if (val < 1000) {
            throw new Error('Healthcheck frequency must be greater than 1000 milliseconds')
          }
        },
        default: 2000
      }
    }
  },
  logging: {
    enabled: {
      doc: 'If true, logging is enabled using the following settings.',
      format: Boolean,
      default: true
    },
    level: {
      doc: 'Sets the logging level.',
      format: ['debug', 'info', 'warn', 'error', 'trace'],
      default: 'info'
    },
    path: {
      doc: 'The absolute or relative path to the directory for log files.',
      format: String,
      default: './log'
    },
    filename: {
      doc: 'The name to use for the log file, without extension.',
      format: String,
      default: 'publish'
    },
    extension: {
      doc: 'The extension to use for the log file.',
      format: String,
      default: 'log'
    },
    accessLog: {
      enabled: {
        doc: 'If true, HTTP access logging is enabled. The log file name is similar to the setting used for normal logging, with the addition of "access". For example `publish.access.log`.',
        format: Boolean,
        default: true
      }
    }
  },
  whitelabel: {
    requireAuthentication: false,
    backgroundImage: {
      doc: 'The background image URL',
      format: String,
      default: 'bg.png'
    },
    logo: {
      doc: 'The logo URL',
      format: String,
      default: 'logo.png'
    },
    poweredBy: {
      doc: 'Whether to include a "Powered by DADI Publish" section',
      format: Boolean,
      default: false
    },
    displayVersionNumber: {
      doc: 'Whether to display the version of the application in the navigation menu',
      format: Boolean,
      default: true
    }
  }
}
