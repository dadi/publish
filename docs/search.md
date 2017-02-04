### Search

Document search exists in two forms. **Filters** and **Standard Search**

This document aims to cover the basics of **Standard Search** only.

Publish search is powered by @dadi/api. Optionally, it can also inject content into ElasticSearch.

#### Requirements

- Search hook in API
- Search endpoint in API
- Search collection in API
- Search block in collection field

When all three parameters are met, the standard search field in the document list view will work. 

#### Search block

```json

"search": {
  "indexed": true,
  "store": true
}

```

The **indexed** parameter tells the hook whether this field should be indexed
The **store** parameter tells the indexer whether this field should be stored in elasticsearch

On some occasions you may want elasticsearch to store a value in order to return it with the results payload whilst not indexing it.
If **indexed** is `true`, **store** will be overridden.

#### Search hook

The search hook runs `afterCreate` and `afterUpdate`. It will reverse index all content where `search.indexed` is true. 

#### Search collection

The search collection must be formatted to match the name of the current document collection with `Search` appended, for example _publicationsSearch_.

The collection stores a reference to the origin document within each result, as well as weight metrics, the word, and the count.

#### Search endpoint

The search endpoint takes all searched keywords, retrieves search entries with a matching word, then orders by frequency within the document and reverse frequency (count/totalWords).

It returns documents along with further search metadata.

### Known issues

Currently Publish cannot paginate search results. This is a frontend issue, but pay required the page value to be sent to the search endpoint
