## Multiple API support

Publish supports multiple APIs, with conditional alterations to `slug`.

### Collection name clash

If two connected apis have a duplicate collection names, the first collection will retain it's name, and all subsequent collection slugs will be appended with `-{count}`: *Example*: `/articles`, `/articles-2`, `/articles-3`.

### Avoiding a clash

This logic can be bypassed if either

a) The two collections exist at different levels, or within different [Collection Groups](https://github.com/dadi/publish/blob/master/docs/collection-groups.md). *Example*: `/articles`, `/magazine/articles`, `/shopping/articles`
b) A custom name for a collection exists in config

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
  {"articles-custom": "articles-2"}
 ]
```
