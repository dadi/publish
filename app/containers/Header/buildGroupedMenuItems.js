import * as Constants from 'lib/constants'

export default function buildGroupedMenuItems(api, currentCollection) {
  const media = {
    id: '_media',
    label: 'Media Library',
    href: '/media',
    isSelected: currentCollection === Constants.MEDIA_COLLECTION_SCHEMA.slug
  }

  if (!api || !Array.isArray(api.collections)) {
    return [media]
  }

  // There are some collections that we don't want to display on the menu,
  // like legacy media collections.
  const collections = api.collections.filter(collection => {
    const isMediaCollection =
      collection.settings && collection.settings.type === 'media'

    return !isMediaCollection
  })

  const navItems = []
  const processedSlugs = {}

  const menu = Array.isArray(api.menu) ? api.menu : []

  menu.forEach(item => {
    // Is this entry a top-level collection?
    if (typeof item === 'string') {
      const match = collections.find(({slug}) => slug === item)

      if (match) {
        navItems.push({
          id: match.slug,
          label: match.name || match.slug,
          href: match._publishLink,
          isSelected: match.slug === currentCollection
        })

        processedSlugs[match.slug] = true
      }

      return
    }

    // Is this entry a collection group?
    if (Array.isArray(item.collections) && item.title) {
      let groupHasSelectedCollection = false

      const groupCollections = item.collections
        .map(item => {
          const match = collections.find(({slug}) => slug === item)

          if (match) {
            const {_publishLink, settings = {}, slug} = match
            const isSelected = slug === currentCollection

            if (isSelected) {
              groupHasSelectedCollection = true
            }

            processedSlugs[slug] = true

            return {
              id: slug,
              label: settings.displayName || slug,
              href: _publishLink,
              isSelected
            }
          }

          return null
        })
        .filter(Boolean)

      if (groupCollections.length > 0) {
        navItems.push({
          isSelected: groupHasSelectedCollection,
          label: item.title,
          subItems: groupCollections
        })
      }
    }
  })

  // Adding to the nav any collections that haven't been included in the menu
  // config object.
  collections.forEach(collection => {
    if (processedSlugs[collection.slug]) return

    const {_publishLink, settings = {}, slug} = collection

    navItems.push({
      id: slug,
      label: settings.displayName || slug,
      href: _publishLink,
      isSelected: slug === currentCollection
    })
  })

  navItems.push(media)

  return navItems
}
