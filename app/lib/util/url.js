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
