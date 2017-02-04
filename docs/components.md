- [Overview](#overview)
  - [Inputs](#inputs)
    - [Select](#select)
  - [Clipboard](#clipboard)

  # Overview

  ## Inputs

  ### Select

  The select is a configurable dropdown options menu which can either display injected options or query an endpoint to retrieve filterable payload.

| Options | Default        | Example           | Description  |
| :------------- |:-------------:| :-------------| :-------------|
| limit      | null | limit : 20 | The maximum number or selectable options |
| searchable      | true | searchable : true | Search input |

### Search
1. The search input comprises of a single text search input. 
2. It can be linked to one or collections, both local and remote.
3. Search uses JOQULAR (JavaScript Object QUery LAnguage Representation).

| Options | Default        | Example           | Description  |
| :------------- |:-------------:| :-------------| :-------------|
| fields      | null | {foo: 1, bar: 1} | The fields that this search can be applied to |
| collections      | null | {articles: 1, tags: 1} | Collections to search agains |
| filter      | null | {age: {$gte: 21}} | Filters can be predefined, often by the collection schema or by the parent container |

## Clipboard
The clipboard component takes a single value, presents it to the user and allows them to either manually select part or all of the value in the container or hit the *copy to clipboard* button.

### Feedback
| action | Returns |
| :------------- |:-------------| 
| copiedToClipboard      | `{success: {success, value: "Foo bar baz"}}` | 
