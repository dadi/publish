const config = require('../../config')
const request = require('request-promise')
const {slugify} = require('../../shared/lib/string')

/**
 * Augment collection schema with a `publish` block for each field.
 *
 * @param  {Object} fields
 * @param  {Object} settings
 * @return {Object}
 */
const applyDefaultPublishParams = fields => {
  const defaultBlock = {
    display: {
      edit: true,
      list: false
    },
    placement: 'main',
    section: 'General'
  }

  // Mutate fields to include required publish config.
  const augmentedFields = Object.keys(fields).reduce((result, key) => {
    const field = fields[key]

    field.publish = field.publish || defaultBlock
    field.publish.section = field.publish.section || defaultBlock.section
    field.publish.placement = field.publish.placement || defaultBlock.placement

    result[key] = field

    return result
  }, {})

  return augmentedFields
}

module.exports = async accessToken => {
  const api = config.get('api')
  const unauthenticatedResponse = {
    api: null,
    client: null,
    config: config.getUnauthenticated()
  }

  if (!accessToken || !api) {
    return Promise.resolve(unauthenticatedResponse)
  }

  const response = {}

  const requestOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    json: true
  }

  const apiAddress =
    api.serverAccessHost && api.serverAccessPort
      ? `${api.serverAccessHost}:${api.serverAccessPort}`
      : `${api.host}:${api.port}`

  try {
    const {results: clients} = await request(
      `${apiAddress}/api/client`,
      requestOptions
    )

    if (clients.length === 0) {
      return Promise.reject()
    }

    response.client = clients[0]
    response.config = config.get()

    // Run requests in parallel, then await both at once.
    const languagesPromise = request(
      `${apiAddress}/api/languages`,
      requestOptions
    )
    const collectionsPromise = request(
      `${apiAddress}/api/collections`,
      requestOptions
    )
    const {results: languages} = await languagesPromise
    const {collections} = await collectionsPromise

    response.config.api.languages = languages

    const {menu} = response.config.api

    // A map corresponding collection names to a group, if they are part
    // of one.
    const collectionGroups = menu.reduce((groups, item) => {
      const {collections, title} = item

      if (Array.isArray(collections) && typeof title === 'string') {
        collections.forEach(collection => {
          groups.set(collection, title)
        })
      }

      return groups
    }, new Map())

    const isMultiProperty = collections.some(
      (collection, index, collections) =>
        collections[index - 1] &&
        collection.property !== collections[index - 1].property
    )

    // Augmenting collection objects with `_publishLink` properties, which
    // contain a link to the collection (i.e. group + collection).
    const augmentedCollections = collections
      .map(collection => {
        const property = isMultiProperty ? `/${collection.property}` : ''
        const group = collectionGroups.get(collection.slug)
        const slugifiedGroup = group ? slugify(group) : null
        const href = group
          ? `${property}/${slugifiedGroup}/${collection.slug}`
          : `${property}/${collection.slug}`

        return {
          ...collection,
          fields: applyDefaultPublishParams(collection.fields),
          _publishCollection: collection.slug,
          _publishGroup: slugifiedGroup,
          _publishLink: href
        }
      })
      .filter(({settings}) => {
        return !(settings.publish && settings.publish.hidden)
      })

    response.config.api.collections = augmentedCollections
    response.config.api.isMultiProperty = isMultiProperty

    return response
  } catch (error) {
    return {...unauthenticatedResponse, error}
  }
}
