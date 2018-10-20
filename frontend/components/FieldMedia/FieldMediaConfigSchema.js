'use strict'

module.exports = {
  FieldMedia: {
    accept: {
      availableInFrontend: true,
      default: ['*/*'],
      doc: 'File types',
      type: Array
    },
    availableInFrontend: true,
    cdn: {
      availableInFrontend: true,
      doc: 'DADI CDN',
      enabled: {
        availableInFrontend: true,
        default: false,
        type: Boolean
      },
      host: {
        availableInFrontend: true,
        default: '0.0.0.0',
        format: 'url'
      },
      path: {
        availableInFrontend: true,
        default: '',
        format: String
      },
      port: {
        availableInFrontend: true,
        default: 3000,
        format: 'port'
      }
    },
    doc: 'Media field'
  }
}
