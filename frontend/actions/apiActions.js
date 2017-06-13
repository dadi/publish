import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'

export function loadApis () {
  return (dispatch, getState) => {
    const {
      apis,
      auth
    } = getState().app.config

    if (!apis) return

    dispatch(setApiStatus(Constants.STATUS_LOADING))

    let apisToProcess = apis.length
    let apisWithCollections = []

    apis.forEach(api => {
      apiBridgeClient({api}).getCollections().then(({collections}) => {
        // This bundler will be used to get all the collections schemas for
        // this API in bulk.
        const collectionBundler = apiBridgeClient.getBundler()

        collections.forEach(collection => {
          const collectionQuery = apiBridgeClient({
            api,
            collection,
            inBundle: true
          }).getConfig()

          collectionBundler.add(collectionQuery)
        })

        collectionBundler.run()
          .then(apiCollections => {
            const isAuthApi = auth.host === api.host && auth.port === api.port
            const mergedCollections = apiCollections.map((schema, index) => {
              if (schema.apiBridgeError) return null

              return Object.assign({}, schema, collections[index], {
                _isAuthCollection: isAuthApi && (auth.collection === collections[index].slug)
              })
            }).filter(Boolean).filter(collection => {
              return !(collection.settings.publish && collection.settings.publish.hidden)
            })

            const apiWithCollections = Object.assign({}, api, {
              _failedCollections: apiCollections.length - mergedCollections.length,
              _isAuthApi: isAuthApi,
              collections: mergedCollections
            })

            apisWithCollections.push(apiWithCollections)
            apisToProcess--

            if (apisToProcess === 0) {
              dispatch(setApiList(apisWithCollections))
            }
          })
          .catch(err => {
            dispatch(setApiStatus(Constants.STATUS_FAILED))
          })
      })
      .catch(err => {
        dispatch(setApiStatus(Constants.STATUS_FAILED))
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
