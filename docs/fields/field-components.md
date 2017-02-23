## Field components

#### Field folder structure

```
Fields    
│
└─── Field
     │
     └─── Field.js
     │    > Field component
     │   
     └─── FieldConfigSchema.json
     │    > Optional: The additional config parameters for this field, including defaults
     │
     └─── FieldRoutes.json
     │    > Optional: The additional routes available to this field

```


#### Field configurations

We store the config schema in [dadi/config-schema.js](https://github.com/dadi/publish/blob/master/dadi/config-schema.js). 
Fields can append the schema with field-specific values, for example an Image field 
```
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
    accessKey: {
      doc: "AWS Access Key",
      format: String,
      default: "",
      env: "AWS_ACCESS_KEY"
    },
    secretKey: {
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
```

#### Fields routes

For security reasons, fields that require sensitive credentials can offer a route as a proxy for the service.

*Example*
The Image field will include the root `/fields/image/s3/sign` which will append a [Temporary signing header](http://docs.aws.amazon.com/AmazonS3/latest/dev/RESTAuthentication.html#UsingTemporarySecurityCredentials)

The field would look something like this:

```html
<Image
  accept={ actions.config.Image.s3.accept }
  signingUrlWithCredentials={ action.config.Image.s3.enabled } // 
/>
```
