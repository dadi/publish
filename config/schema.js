const SCHEMA = {
  api: {
    menu: {
      default: [],
      doc: 'Collection menu ordering and grouping',
      format: Array
    },
    host: {
      default: '0.0.0.0',
      format: String,
      showToUnauthenticatedUsers: true
    },
    port: {
      default: 80,
      format: 'port',
      showToUnauthenticatedUsers: true
    }
  },
  app: {
    name: {
      default: 'DADI Publish',
      doc: 'The applicaton name',
      format: String
    }
  },
  cdn: {
    publicUrl: {
      default: null,
      doc: 'The host of the URL where the CDN instance can be publicly reached',
      format: '*'
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
        default: 'YYYY/MM/DD HH:mm',
        doc: 'Date Format',
        format: String
      },
      short: {
        default: 'YYYY/MM/DD',
        doc: 'Date Format',
        format: String
      }
    }
  },
  healthcheck: {
    enabled: {
      default: true,
      doc: 'Healthcheck is enabled',
      format: Boolean,
      showToUnauthenticatedUsers: true
    },
    frequency: {
      default: 2000,
      doc: 'Interval between health checks, in milliseconds',
      format: function check(val) {
        if (isNaN(val)) {
          throw new Error(
            'Healthcheck frequency must be a valid number and greater than 1000'
          )
        }

        if (val < 1000) {
          throw new Error(
            'Healthcheck frequency must be greater than 1000 milliseconds'
          )
        }
      },
      showToUnauthenticatedUsers: true
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
        doc:
          'If true, HTTP access logging is enabled. The log file name is similar to the setting used for normal logging, with the addition of "access". For example `publish.access.log`.',
        format: Boolean,
        default: true
      }
    }
  },
  publicUrl: {
    host: {
      doc:
        'The host of the URL where the Publish instance can be publicly reached',
      format: '*',
      default: null,
      env: 'URL_HOST'
    },
    port: {
      doc:
        'The port of the URL where the Publish instance can be publicly reached',
      format: '*',
      default: null,
      env: 'URL_PORT'
    },
    protocol: {
      doc:
        'The protocol of the URL where the Publish instance can be publicly reached',
      format: 'String',
      default: 'http',
      env: 'URL_PROTOCOL'
    }
  },
  server: {
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
    sslCertificatePath: {
      doc: 'The path to a SSL certificate',
      format: String,
      default: '',
      env: 'SSL_CERTIFICATE_PATH'
    },
    sslIntermediateCertificatePath: {
      doc: 'The path to a SSL intermediate certificate, if any',
      format: String,
      default: '',
      env: 'SSL_INTERMEDIATE_CERTIFICATE_PATH'
    },
    sslIntermediateCertificatePaths: {
      doc:
        'The paths to SSL intermediate certificates, overrides sslIntermediateCertificate (singular)',
      format: Array,
      default: [],
      env: 'SSL_INTERMEDIATE_CERTIFICATE_PATHS'
    },
    sslPassphrase: {
      doc: 'The passphrase of the SSL private key',
      format: String,
      default: '',
      env: 'SSL_PRIVATE_KEY_PASSPHRASE'
    },
    sslPrivateKeyPath: {
      doc: 'The path to a SSL private key',
      format: String,
      default: '',
      env: 'SSL_PRIVATE_KEY_PATH'
    }
  },
  whitelabel: {
    backgroundImage: {
      default: 'bg.png',
      doc: 'The background image URL',
      format: String,
      showToUnauthenticatedUsers: true
    },
    displayVersionNumber: {
      default: true,
      doc:
        'Whether to display the version of the application in the navigation menu',
      format: Boolean,
      showToUnauthenticatedUsers: true
    },
    logoDark: {
      default: 'images/logo-dark.svg',
      doc: 'The URL of the logo to be used on light backgrounds',
      format: String,
      showToUnauthenticatedUsers: true
    },
    logoLight: {
      default: 'images/logo-light.svg',
      doc: 'The URL of the logo to be used on dark backgrounds',
      format: String,
      showToUnauthenticatedUsers: true
    },
    poweredBy: {
      default: false,
      doc: 'Whether to include a "Powered by DADI Publish" section',
      format: Boolean,
      showToUnauthenticatedUsers: true
    }
  }
}

module.exports = SCHEMA
