# Publish block

Publish can use a variety of extended field values to aid the UI and document operations. These fields are defined in a `publish` object within the field definition on the collection schema.

Currently, the supported fields are:

| Field       | Description                                                                                | Example               | Default |
|-------------|--------------------------------------------------------------------------------------------|-----------------------|---------|
| `section`   | Human-friendly name of the section                                                         | `"Article"`           | None    |
| `position`  | Position of the field within the document editing interface                                | `"main"`, `"sidebar"` | None    |
| `multiline` | When set to `true`, String fields will be rendered with a textarea instead of a text input | `true`                | `false` |
| `options`   | Limits the content of the field to a fixed set of values. It's defined as an array of objects containing `value` and `label` properties. When used with the String field, a dropdown is rendered | `[{"value": "uk", "label": "United Kingdom"}]`                | `null` |
| `multiple`  | Defines whether the field allows multiple values. When used with the String field and `options` is defined, a multi-select dropdown is rendered | `true`                | `false` |
| `limit`     | Defines the maximum number of values allowed in the field. Overrides `multiple` | `10`                | `1` |

*Example field definition:*

```json
"synopsis": {
  "type": "String",
  "label": "Synopsis",
  "validation": {},
  "message": "can't be empty",
  "display": {
    "index": true,
    "edit": true
  },
  "publish": {
    "section": "Article",
    "position": "main",
    "multiline": true
  }
}
```

The app should gracefully fail when these fields are not present.
