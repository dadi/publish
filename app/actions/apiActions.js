import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'

export function loadApi() {
  return (dispatch, getState) => {
    const {api} = getState().app.config

    if (!api) return

    dispatch(setApiStatus(Constants.STATUS_LOADING))

    let apiObject = Object.assign({}, api)

    // 1: Get list of supported languages.
    return apiBridgeClient({
      accessToken: getState().user.accessToken,
      api
    })
      .getLanguages()
      .then(({results: languages}) => {
        apiObject.languages = languages

        // 2: Get list of collections.
        return apiBridgeClient({
          accessToken: getState().user.accessToken,
          api
        }).getCollections()
      })
      .then(({collections}) => {
        // 3: Augmenting collection schemas with default Publish
        // parameters.
        const augmentedCollections = collections
          .map(collection => {
            return Object.assign({}, collection, {
              fields: applyDefaultPublishParams(collection.fields)
            })
          })
          .filter(collection => {
            return !(
              collection.settings.publish && collection.settings.publish.hidden
            )
          })

        apiObject.collections = augmentedCollections

        return apiObject
      })
      .then(api => {
        dispatch(setApi(api))
      })
      .catch(error => {
        dispatch(setApiStatus(Constants.STATUS_FAILED, error.code || error))
      })
  }
}

export function setApi(api) {
  return {
    api,
    type: Types.SET_API
  }
}

export function setApiStatus(status, error) {
  return {
    error,
    status,
    type: Types.SET_API_STATUS
  }
}

const applyDefaultPublishParams = fields => {
  const defaultPublishBlock = {
    display: {
      edit: true,
      list: false
    },
    placement: 'sidebar',
    section: 'General'
  }

  // Mutate fields to include required publish config.
  const mutatedFields = Object.assign(
    fields,
    ...Object.keys(fields).map(key => {
      let field = fields[key]

      field.publish = field.publish || defaultPublishBlock
      field.publish.section =
        field.publish.section || defaultPublishBlock.section
      field.publish.placement =
        field.publish.placement || defaultPublishBlock.placement

      return {
        [key]: field
      }
    })
  )

  return mutatedFields
}
