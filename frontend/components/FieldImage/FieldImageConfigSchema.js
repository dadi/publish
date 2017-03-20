'use strict'

module.exports = {
  FieldImage: {
    availableInFrontend: true,
    doc: "Image field",
    accept: {
      availableInFrontend: true,
      doc: "File types",
      type: Array,
      default: ["image/*"]
    },
    cdn: {
      doc: "DADI CDN",
      availableInFrontend: true,
      enabled: {
        availableInFrontend: true,
        type: Boolean,
        default: false
      },
      host: {
        availableInFrontend: true,
        format: 'url',
        default: '0.0.0.0'
      },
      path: {
        availableInFrontend: true,
        format: String,
        default: ''
      },
      port: {
        availableInFrontend: true,
        format: 'port',
        default: 3000
      }
    },
    s3: {
      doc: "Store Image in S3",
      availableInFrontend: true,
      enabled: {
        availableInFrontend: true,
        type: Boolean,
        default: false
      },
      accessKeyId: {
        doc: "AWS Access Key ID",
        format: String,
        default: "",
        env: "AWS_ACCESS_KEY"
      },
      secretAccessKey: {
        doc: "AWS Secret Key",
        format: String,
        default: "",
        env: "AWS_SECRET_KEY"
      },
      bucketName: {
        doc: "AWS Bucket Name",
        format: String,
        default: "",
        env: "AWS_S3_BUCKET"
      },
      region: {
        doc: "AWS Region",
        format: String,
        default: "",
        env: "AWS_REGION"
      }
    }
  }
}
