'use strict'

module.exports = {
  FieldImage: {
    accept: {
      availableInFrontend: true,
      default: ['image/*'],
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
    doc: 'Image field',
    s3: {
      accessKeyId: {
        default: '',
        doc: 'AWS Access Key ID',
        env: 'AWS_ACCESS_KEY',
        format: String
      },
      availableInFrontend: true,
      bucketName: {
        default: '',
        doc: 'AWS Bucket Name',
        env: 'AWS_S3_BUCKET',
        format: String
      },
      doc: 'Store Image in S3',
      enabled: {
        availableInFrontend: true,
        default: false,
        type: Boolean
      },
      region: {
        default: '',
        doc: 'AWS Region',
        env: 'AWS_REGION',
        format: String
      },
      secretAccessKey: {
        default: '',
        doc: 'AWS Secret Key',
        env: 'AWS_SECRET_KEY',
        format: String
      }
    },
    useAPI: {
      availableInFrontend: true,
      default: true,
      type: Boolean
    }
  }
}
