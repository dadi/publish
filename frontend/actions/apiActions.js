import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'
import {signOut} from 'actions/userActions'

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
      const apiConfig = apiBridgeClient({
        api
      })
      .getConfig()
      .then(config => {
        if ('undefined' === typeof config) {
          return Promise.reject(new Error('Config is undefined'))
        }
        apiBridgeClient({api})
          .getCollections()
          .then(response => {
            if ('undefined' === typeof response) {
              return Promise.reject(new Error('Response is undefined'))
            }
            const collections = response.collections

            if ('undefined' === typeof collections) {
              return Promise.reject(new Error('No collections'))
            }

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
              const mergedCollections = apiCollections
                .map((schema, index) => {
                  if (schema.apiBridgeError) return null

                  schema = applyDefaultPublishParams(schema)

                  return Object.assign({}, schema, collections[index], {
                    _isAuthCollection: isAuthApi && (auth.collection === collections[index].slug)
                  })
                })
                .filter(Boolean)
                .filter(collection => {
                  return !(collection.settings.publish && collection.settings.publish.hidden)
                })

              const apiWithCollections = Object.assign({}, api, {
                _failedCollections: apiCollections.length - mergedCollections.length,
                _isAuthApi: isAuthApi,
                collections: mergedCollections,
                publicUrl: config.publicUrl
              })

              apisWithCollections.push(apiWithCollections)
              apisToProcess--

              if (apisToProcess === 0) {
                dispatch(setApiList(apisWithCollections))
              }
            })
            .catch(err => {
              console.log(73, err)
              dispatch(setApiStatus(Constants.STATUS_FAILED))
            })
          })
        .catch(err => {
          console.log(78, err)
          dispatch(setApiStatus(Constants.STATUS_FAILED))
        })
      })
      .catch(err => {
        console.log(83, err)
        console.log('No config means I should log out.')
        dispatch(signOut())
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

/**
 * Apply Required Mutations
 * @param  {Object} schema     Collection schema.
 * @return {Object} Mutated collection schema.
 */
const applyDefaultPublishParams = schema => {
  const publish = {
    display: {
      edit: true,
      list: false
    },
    placement: 'sidebar',
    section: 'General'
  }

  // Mutate fields to include required publish config.
  const fields = Object.assign(schema.fields, ...Object.keys(schema.fields)
    .map(key => {
      let field = schema.fields[key]

      if (!field.publish) field.publish = publish

      field.publish.section = field.publish.section || publish.section
      field.publish.placement = field.publish.placement || publish.placement
      field.publish.display = field.publish.display || publish.display

      return {[key]: field}
    }))

  return Object.assign(schema, {fields})
}
