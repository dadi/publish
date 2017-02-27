module.exports = {
  Image: {
    doc: "Image field",
    accept: {
      doc: "File types",
      type: Array,
      default: ["image/*"]
    },
    enabled: {
      type: Boolean,
      default: true
    },
    local: {
      type: Boolean,
      default: true
    },
    s3: {
      doc: "Store Image in S3",
      enabled: {
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
