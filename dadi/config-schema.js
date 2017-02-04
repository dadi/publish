module.exports = {
  app: {
    name: {
      doc: "The applicaton name",
      format: String,
      default: "DADI Publish (Repo Default)"
    },
    publisher: {
      doc: "The organisation name",
      format: String,
      default: "DADI"
    },
    baseUrl: {
      doc: "The base URL of the application",
      format: "url",
      default: "http://localhost:3001"
    }
  },
  server: {
    host: {
      doc: "The IP address or interface to bind to",
      format: "ipaddress",
      default: "0.0.0.0"
    },
    port: {
      doc: "The port to bind to",
      format: "port",
      default: 3001
    },
    protocol: {
      doc: "The protocol the web application will use",
      format: String,
      default: "http",
      env: "PROTOCOL"
    },
    sslPassphrase: {
      doc: "The passphrase of the SSL private key",
      format: String,
      default: "",
      env: "SSL_PRIVATE_KEY_PASSPHRASE"
    },
    sslPrivateKeyPath: {
      doc: "The filename of the SSL private key",
      format: String,
      default: "",
      env: "SSL_PRIVATE_KEY_PATH"
    },
    sslCertificatePath: {
      doc: "The filename of the SSL certificate",
      format: String,
      default: "",
      env: "SSL_CERTIFICATE_PATH"
    },
    sslIntermediateCertificatePath: {
      doc: "The filename of an SSL intermediate certificate, if any",
      format: String,
      default: "",
      env: "SSL_INTERMEDIATE_CERTIFICATE_PATH"
    },
    sslIntermediateCertificatePaths: {
      doc: "The filenames of SSL intermediate certificates, overrides sslIntermediateCertificate (singular)",
      format: Array,
      default: [],
      env: "SSL_INTERMEDIATE_CERTIFICATE_PATHS"
    }
  },
  monitor: {
    enabled: {
      doc: "If true, monitor the platform server statistics and output in console",
      format: Boolean,
      default: true
    },
    store: {
      doc: "If true, store status details against the API record",
      format: Boolean,
      default: true
    },
    refreshCollections: {
      doc: "If true, refresh collection schemas",
      format: Boolean,
      default: true
    }
  },
  paths: {
      doc: "Customisable asset paths",
      format: Object,
      default: {
        language: __dirname + '/../language',
        workspace: __dirname + '/../workspace',
        db: __dirname + '/../workspace/db'
      }
    },
  TZ: {
    doc: "Process Timezone",
    default: "Europe/London"
  },
  env: {
    doc: "The applicaton environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  i18n: {
    defaultLanguage: {
      doc: "Default language for the system, used as a fallback in case a translation is missing",
      format: String,
      default: 'en'
    }
  },
  ui: {
    inputDelay: {
      doc: "Delay in ms to debounce inputs by",
      format: "integer",
      default: 100
    }
  },
  localDB: {
    authenticate: {
      doc: "Use authentication on localDB API",
      format: Boolean,
      default: true
    }
  },
  caching: {
    redis: {
          enabled: {
            doc: "If enabled, cache files will be saved to the specified Redis server",
            format: Boolean,
            default: false,
            env: "REDIS_ENABLED"
          },
          host: {
            doc: "The Redis server host",
            format: String,
            default: "127.0.0.1",
            env: "REDIS_HOST"
          },
          port: {
            doc: "The port for the Redis server",
            format: 'port',
            default: 6379,
            env: "REDIS_PORT"
          },
          password: {
            doc: "",
            format: String,
            default: "",
            env: "REDIS_PASSWORD"
          }
        }
  }
}
