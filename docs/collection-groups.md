## Collection groups

To condense navigation and group collections by type, collection groups can be created in config. Currently these exist in the config schema found in `/config`. 

By default, all collections will be visible in the top-level navigation.

```json
"menu": [
  {
    "title": "Taxonomy",
    "taxonomy": [
      "redirects",
      "robots"
    ]
  },
  "articles",
  "books"
 ]
```
