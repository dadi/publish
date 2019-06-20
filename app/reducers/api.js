import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'

const serverData = typeof window !== 'undefined' ? window.__api__ : null

export const initialState = {
  collections: (serverData && serverData.collections) || [],
  error: null,
  isLoaded: Boolean(serverData),
  isLoading: false,
  languages: (serverData && serverData.languages) || [],
  menu: [],
  url: null
}

export default function api(state = initialState, action = {}) {
  switch (action.type) {
    /*case Types.SET_API:
      const {
        collections,
        host,
        languages,
        menu,
        port
      } = action.api

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

      // Augmenting collection objects with `_publishLink` properties, which
      // contain a link to the collection (i.e. group + collection).
      const augmentedCollections = collections.map(collection => {
        const group = collectionGroups.get(collection.slug)
        const href = group
          ? `/${Format.slugify(group)}/${collection.slug}`
          : `/${collection.slug}`

        return {
          ...collection,
          _publishLink: href
        }
      })

      return {
        ...state,
        collections: augmentedCollections,
        isLoaded: true,
        isLoading: false,
        languages,
        menu,
        url: `${host}:${port}`
      }

    case Types.SET_API_STATUS:
      if (action.error === Constants.API_UNAUTHORISED_ERROR) {
        return initialState
      }

      switch (action.status) {
        case Constants.STATUS_LOADING:
        case Constants.STATUS_SAVING:
          return {
            ...state,
            isLoading: true
          }

        // Fetch or save have failed.
        case Constants.STATUS_FAILED:
          return {
            ...state,
            isLoading: false,
            error: action.data || 500
          }
      }

      return state

    case Types.SIGN_OUT:
      return initialState*/

    default:
      return state
  }
}

// function addCollectionLinks(apis) {
//   // A hash object keeping a count for each menu item + collection name
//   // pair. Whenever a count is greater than 1, it means a collection –
//   // i.e. two collections with the same name either under the same menu
//   // item or under no menu.
//   const counts = {}

//   // This method takes a menu item slug and a collection name. It adds
//   // the pair to the `counts` hash map and returns a key for the pair,
//   // as well as a suffix which is something like '-2', '-3' etc. if
//   // there is a collision or an empty string otherwise.
//   const getKeyAndSuffix = (collectionName, menuSlug) => {
//     const key = menuSlug ? `${menuSlug}/${collectionName}` : collectionName

//     counts[key] = counts[key] || 0
//     counts[key]++

//     return {
//       key,
//       suffix: counts[key] > 1 ? `-${counts[key]}` : ''
//     }
//   }

//   apis
//     .filter(api => {
//       return Boolean(api.collections && api.collections.length)
//     })
//     .forEach(api => {
//       // There are some collections that we don't want to display on the menu,
//       // like auth or media collections.
//       const filteredCollections = api.collections.filter(collection => {
//         const isMediaCollection =
//           collection.settings && collection.settings.type === 'media'

//         return !isMediaCollection
//       })
//       const {menu = []} = api

//       // We start by adding all the collections that are referenced in the menu
//       // object.
//       menu.forEach(menuItem => {
//         // If this is a menu item with nested collections, we'll process each of
//         // them individually.
//         if (menuItem.title && menuItem.collections) {
//           const menuSlug = Format.slugify(menuItem.title)

//           menuItem.collections.forEach(collectionName => {
//             const collection = api.collections.find(item => {
//               return item.slug === collectionName
//             })

//             if (!collection) return

//             const {key, suffix} = getKeyAndSuffix(collectionName, menuSlug)

//             collection._publishLink = `/${key}${suffix}`
//             collection._publishMenu = menuItem.title
//           })
//         } else if (typeof menuItem === 'string') {
//           // This is a top-level collection, so `menuItem` is the name of the
//           // a collection.
//           const collection = api.collections.find(item => {
//             return item.slug === menuItem
//           })

//           if (!collection) return

//           const {key, suffix} = getKeyAndSuffix(menuItem)

//           collection._publishLink = `/${key}${suffix}`
//           collection._publishMenu = null
//         }
//       })

//       // Then we loop through all collections in the API and process any that
//       // are missing from the menu object.
//       filteredCollections.forEach(collection => {
//         // The collection has already been processed, nothing to do here.
//         if (collection._publishLink) {
//           return
//         }

//         const {key, suffix} = getKeyAndSuffix(collection.slug)

//         collection._publishLink = `/${key}${suffix}`
//         collection._publishMenu = null
//       })
//     })
// }
