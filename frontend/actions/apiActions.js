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

    let apiList = []
    let apiQueue = apis.map((api, apiIndex) => {
      // 1: Get API config.
      return apiBridgeClient({
        accessToken: getState().user.accessToken,
        api
      }).getConfig().then(config => {
        apiList[apiIndex] = Object.assign({}, api, {
          publicUrl: config.publicUrl
        })

        // 2: Get list of collections.
        return apiBridgeClient({
          accessToken: getState().user.accessToken,
          api
        }).getCollections()
      })
      .then(({collections}) => {
        // 3: Get collection schema.
        let queue = collections.map(collection => {
          return apiBridgeClient({
            accessToken: getState().user.accessToken,
            api,
            collection
          }).getConfig().then(collectionSchema => {
            return Object.assign({}, collection, collectionSchema)
          })
        })

        return Promise.all(queue)
      })
      .then(apiCollections => {
        // 4: Augmenting collection schemas with default Publish
        // parameters.
        let augmentedCollections = apiCollections
          .map((schema, index) => {
            return Object.assign(
              {},
              applyDefaultPublishParams(schema)
            )
          })
          .filter(collection => {
            return !(collection.settings.publish && collection.settings.publish.hidden)
          })

        apiList[apiIndex].collections = augmentedCollections

        return apiList[apiIndex]
      })
    })

    return Promise.all(apiQueue).then(apiList => {
      dispatch(
        setApiList(apiList, getState().router.parameters)
      )
    }).catch(error => {
      dispatch(
        setApiStatus(Constants.STATUS_FAILED, error.code || error)
      )
    })
  }
}

export function setApi (api) {
  return {
    api,
    type: Types.SET_API,
  }
}

export function setApiList (apis, routeParameters) {
  return {
    apis,
    routeParameters,
    type: Types.SET_API_LIST,
  }
}

export function setApiStatus (status, error) {
  return {
    error,
    status,
    type: Types.SET_API_STATUS
  }
}

export function setCurrentCollection ({collection, group, referencedField}) {
  return {
    collection,
    group,
    referencedField,
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
