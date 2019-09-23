export function decodeSearch(searchString) {
  if (!searchString || typeof searchString !== 'string') {
    return {}
  }

  const sanitisedString = decodeURIComponent(searchString)
    .replace(/^(\?)/, '')
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"')
  const parameters = JSON.parse(`{"${decodeURI(sanitisedString)}"}`)

  Object.keys(parameters).forEach(key => {
    try {
      // Trying to parse valid JSON parameters.
      parameters[key] = JSON.parse(parameters[key])
    } catch (err) {
      // noop
    }
  })

  return parameters
}

export function encodeSearch(searchObject) {
  if (!searchObject || !Object.keys(searchObject).length) {
    return ''
  }

  const keys = Object.keys(searchObject)
    .filter(key => searchObject[key])
    .map(key => {
      if (typeof searchObject[key] === 'object') {
        const hasSetKeys = Object.keys(searchObject[key]).some(subKey => {
          return searchObject[key][subKey] !== undefined
        })

        if (!hasSetKeys) {
          return ''
        }

        try {
          return `${key}=${JSON.stringify(searchObject[key])}`
        } catch (err) {
          return `${key}=${searchObject[key]}`
        }
      } else {
        return `${key}=${searchObject[key]}`
      }
    })
    .filter(Boolean)

  if (keys.length === 0) {
    return ''
  }

  return `?${keys.join('&')}`
}

export function buildUrl({
  collection = this.props.route.params.collection,
  createNew,
  documentId = this.props.route.params.documentId,
  group = this.props.route.params.group,
  property = this.props.route.params.property,
  search = this.props.route.search,
  section = this.props.route.params.section
} = {}) {
  if (!createNew && !documentId) section = null
  if (createNew) documentId = 'new'

  const urlNodes = [property, group, collection, documentId, section]

  return '/' + urlNodes.filter(Boolean).join('/') + encodeSearch(search)
}

export function getMediaUrl({config, document, width}) {
  if (!document) return null

  const {_previewData, path, url} = document

  if (_previewData) return _previewData

  const normalisedPath =
    path && (path.indexOf('/') === 0 ? path.slice(1) : path)
  const cdnPublicUrl = config && config.cdn && config.cdn.publicUrl
  const search = typeof width === 'number' ? `?width=${width}` : ''

  if (cdnPublicUrl && normalisedPath) {
    return `${cdnPublicUrl}/${normalisedPath}${search}`
  } else if (url) {
    return url
  }

  return null
}
