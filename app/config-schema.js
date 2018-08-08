'use strict'
const path = require('path')

module.exports = {
  auth: {
    doc: 'Auth API Collection',
    availableInFrontend: true,
    format: Object,
    default: {
      enabled: false
    },
    collection: {
      availableInFrontend: true,
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
    },
    database: {
      availableInFrontend: true,
      format: String,
      default: ''
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
    version: {
      availableInFrontend: true,
      format: String,
      default: '1.0'
    }
  },
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
  },
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
  cdn: {
    availableInFrontend: true,
    publicUrl: {
      doc: 'The host of the URL where the CDN instance can be publicly reached',
      format: '*',
      default: null
    }
  },
  env: {
    availableInFrontend: true,
    doc: 'The applicaton environment.',
    format: String,
    default: 'development',
    env: 'NODE_ENV'
  },
  formats: {
    availableInFrontend: true,
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
    availableInFrontend: true,
    doc: 'Google Analytics options',
    enabled: {
      availableInFrontend: true,
      doc: 'GA events enabled',
      format: Boolean,
      default: false
    },
    trackingId: {
      availableInFrontend: true,
      doc: 'GA Tracking credentials',
      format: String,
      default: ''
    }
  },
  publicUrl: {
    availableInFrontend: true,
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
    ssl: {
      enabled: {
        type: Boolean,
        default: false
      },
      dir: {
        doc: 'Directory for certificate store.',
        type: String,
        default: path.join(__dirname, '/../workspace/certs')
      },
      domains: {
        doc: 'Domains to secure.',
        format: Array,
        default: []
      },
      email: {
        format: String,
        default: 'publish@dadi.co'
      }
    },
    healthcheck: {
      availableInFrontend: true,
      enabled: {
        availableInFrontend: true,
        doc: 'Healthcheck is enabled',
        format: Boolean,
        default: true
      },
      frequency: {
        availableInFrontend: true,
        doc: 'Interval between checks (MS)',
        format: Number,
        default: 2000
      }
    }
  },
  TZ: {
    availableInFrontend: true,
    doc: 'Process Timezone',
    default: 'Europe/London'
  },
  ui: {
    availableInFrontend: true,
    inputDelay: {
      doc: 'Delay in ms to debounce inputs by',
      format: 'integer',
      default: 100
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
    availableInFrontend: true,
    backgroundImage: {
      doc: 'The background image URL',
      format: String,
      default: '/public/images/bg_2.svg'
    },
    logo: {
      doc: 'The logo URL',
      format: String,
      default: '/public/images/publish.png'
    },
    poweredBy: {
      doc: 'Whether to include a "Powered by DADI Publish" section',
      format: Boolean,
      default: false
    }
  }
}
