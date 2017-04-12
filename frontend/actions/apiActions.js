import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'

export function loadApis () {
  return (dispatch, getState) => {
    const apis = getState().app.config.apis

    if (!apis) return

    dispatch(setApiStatus(Constants.STATUS_LOADING))

    let apisToProcess = apis.length
    let apisWithCollections = []

    apis.forEach(api => {
      // This bundler will be used to get the list of collections and extra
      // config properties from this API.
      const apiBundler = apiBridgeClient.getBundler()

      apiBundler.add(apiBridgeClient(api, true).getCollections())
      apiBundler.add(apiBridgeClient(api, true).getConfig())

      apiBundler.run().then(response => {
        const collections = response[0].collections
        const extraConfig = response[1]

        // This bundler will be used to get all the collections schemas for
        // this API in bulk.
        const collectionBundler = apiBridgeClient.getBundler()

        collections.forEach(collection => {
          const collectionQuery = apiBridgeClient(api, true)
            .in(collection.slug)
            .getConfig()

          collectionBundler.add(collectionQuery)
        })

        collectionBundler.run().then(apiCollections => {
          const mergedCollections = apiCollections.map((schema, index) => {
            return Object.assign({}, schema, collections[index])
          }).filter(collection => {
            return !(collection.settings.publish && collection.settings.publish.hidden)
          })

          const apiWithCollections = Object.assign({}, api, extraConfig, {
            collections: mergedCollections
          })

          apisWithCollections.push(apiWithCollections)
          apisToProcess--

          if (apisToProcess === 0) {
            dispatch(setApiList(apisWithCollections))
          }
        })
      })
    })
  }
}

export function setApiList (apis) {
  return {
    apis,
    type: Types.SET_API_LIST,
  }
}

export function setApi (api) {
  return {
    api,
    type: Types.SET_API,
  }
}

export function setApiStatus (status) {
  return {
    status,
    type: Types.SET_API_STATUS
  }
}

export function setCurrentCollection (collectionName) {
  return {
    collectionName,
    type: Types.SET_API_CURRENT_COLLECTION
  }
}
