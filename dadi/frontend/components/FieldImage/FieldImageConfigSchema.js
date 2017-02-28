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
