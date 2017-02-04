### Overview

Publish can use a variety of extended field values to aid the UI and document operations. Publish should gracefully fail when these fields are not present.

#### Publish Block

##### Display
These fields tell Publish where a field lives within navigation, as well as the field **subType** when using a non-primative format.

```json
"publish": {
  "subType": "Image",
  "section": "Assets",
  "subSection": "Visual"
  
}

```


##### Limitations & Filters
For fields such as `Reference`, limit does not apply, so Publish contains an override. 

The **Unique** flag will ensure that the value of a field has not previously been used. This current only works with `Reference`

```json
"publish": {
  "limit": 0,
  "unique": true
}

```

##### Styling

Where it is considered verbose to create a new `subType` simply for the a slight visual change (Usually String), or where the visual representation is not necessarily required in the output, formatting parameters can be used.

```json
"publish": {
  "displaySize": "kilo",
  "format": "markdown"
}

```

#### Settings block

```json

"publish": {
  "group": "Content",
  "messageCollection": "messages"
}
```

The **messagesCollection** is currently disabled, but was built to enable messages to be sent and saved when editing a document with collaborators

The **group** value is used to position a link to the collection within the top level navigation select options.
