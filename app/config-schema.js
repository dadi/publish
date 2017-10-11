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
      default: '127.0.0.1'
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
  TZ: {
    availableInFrontend: true,
    doc: 'Process Timezone',
    default: 'Europe/London'
  },
  env: {
    availableInFrontend: true,
    doc: 'The applicaton environment.',
    format: String,
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
