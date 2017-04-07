# Publish block

Publish can use a variety of extended field values to aid the UI and document operations. These fields are defined in a `publish` object within the field definition on the collection schema.

Currently, the supported fields are:

| Field             | Description                                                                                | Example               | Default |
|-------------------|--------------------------------------------------------------------------------------------|-----------------------|---------|
| `section`         | Human-friendly name of the section                                                         | `"Article"`           | None    |
| `placement`       | Placement of the field within the document editing interface                               | `"main"`, `"sidebar"` | None    |
| `multiline`       | When set to `true`, String fields will be rendered with a textarea instead of a text input | `true`                | `false` |
| `options`         | Limits the content of the field to a fixed set of values. It's defined as an array of objects containing `value` and `label` properties. When used with the String field, a dropdown is rendered | `[{"value": "uk", "label": "United Kingdom"}]`                | `null` |
| `multiple`        | Defines whether the field allows multiple values. When used with the String field and `options` is defined, a multi-select dropdown is rendered | `true`                | `false` |
| `limit`           | Defines the maximum number of values allowed in the field. Overrides `multiple`            | `10`                  | `1`     |
| `display.list`    | Defines whether the field is displayed in the document list view                           | `true`                | `true`  |
| `display.edit`    | Defines whether the field is displayed in the document edit view                           | `true`                | `true`  |
| `readonly`        | Defines whether the document is editable when displayed within the document list view      | `true`                | `false` |
| `subType`         | Defines an optional subType for the field. Currently only used with `type` of `Object`     | `Image`               |  None   |

*Example: A `String` type rendered in the main body as a textarea:*

```json
"synopsis": {
  "type": "String",
  "label": "Synopsis",
  "validation": {},
  "message": "can't be empty",
  "publish": {
    "section": "Article",
    "placement": "main",
    "multiline": true,
    "display": {
      "list": false,
      "edit": true
    },
    "readonly": true
  }
}
```

*Example: A `String` type rendered in the sidebar with a fixed set of values available:*

```json
"country": {
  "type": "String",
  "label": "Country",
  "default": "pt",
  "message": "can't be empty",
  "publish": {
    "section": "Article",
    "placement": "sidebar",
    "display": {
      "list": true,
      "edit": true
    },
    "options": [
      {
        "value": "uk",
        "label": "United Kingdom"
      },
      {
        "value": "pt",
        "label": "Portugal"
      }
    ]
  }
}

*Example: A field with a subType:*

```json
"synopsis": {
  "type": "Object",
  "label": "Lead Image",
  "validation": {},
  "message": "Can be jpeg or png",
  "publish": {
    "section": "Media",
    "placement": "main",
    "display": {
      "list": false,
      "edit": true
    },
    "subType": "Image"
  }
}
```

The app should gracefully fail when these fields are not present.
