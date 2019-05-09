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
      apiList[apiIndex] = Object.assign({}, api)

      // 1: Get list of supported languages.
      return apiBridgeClient({
        accessToken: getState().user.accessToken,
        api
      }).getLanguages()
      .then(({results: languages}) => {
        apiList[apiIndex].languages = languages

        // 2: Get list of collections.
        return apiBridgeClient({
          accessToken: getState().user.accessToken,
          api
        }).getCollections()
      })
      .then(({collections}) => {
        // 3: Augmenting collection schemas with default Publish
        // parameters.
        let augmentedCollections = collections
          .map(collection => {
            return Object.assign(
              {},
              collection,
              {
                fields: applyDefaultPublishParams(collection.fields)
              }
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

/**
 * Apply Required Mutations
 * @param  {Object} fields     Collection fields.
 * @param  {Object} settings     Collection settings.
 * @return {Object} Mutated collection schema.
 */
const applyDefaultPublishParams = fields => {
  let defaultPublishBlock = {
    display: {
      edit: true,
      list: false
    },
    placement: 'main',
    section: 'General'
  }

  // Mutate fields to include required publish config.
  let mutatedFields = Object.assign(fields, ...Object.keys(fields)
    .map(key => {
      let field = fields[key]

      field.publish = field.publish || defaultPublishBlock
      field.publish.section = field.publish.section || defaultPublishBlock.section
      field.publish.placement = field.publish.placement || defaultPublishBlock.placement

      return {
        [key]: field
      }
    }))

  return mutatedFields
}
