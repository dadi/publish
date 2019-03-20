import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'

const SEARCH_CACHE_TTL = 3600000

export function searchCollections ({
  context,
  term
}) {
  return (dispatch, getState) => {
    const queries = getState().search
    const timestamp = Date.now()
    const cachedQuery = queries[context] && queries[context][term]

    if (
      cachedQuery &&
      cachedQuery.timestamp + SEARCH_CACHE_TTL >= timestamp
    ) {
      return
    }

    if (typeof term !== 'string' || term.length === 0) {
      return
    }

    const {accessToken} = getState().user
    const [api] = getState().api.apis
    const {collections} = api
    const queue = collections.map(collection => {
      const primaryField = Object.keys(collection.fields).find(fieldName => {
        return collection.fields[fieldName].type.toLowerCase() === 'string'
      })

      if (!primaryField) return

      const apiBridge = apiBridgeClient({
        accessToken,
        api,
        collection
      }).useFields([primaryField]).whereFieldContains(primaryField, term)

      return apiBridge.find().then(({results}) => {
        return results.map(result => ({...result, _primaryField: primaryField}))
      })
    })

    dispatch({
      context,
      term,
      timestamp,
      type: Types.COLLECTION_SEARCH_START
    })

    return Promise.all(queue).then(responses => {
      const results = responses.reduce((results, response, index) => {
        if (response && response.length > 0) {
          const collectionId = collections[index].path

          results[collectionId] = response
        }

        return results
      }, {})

      dispatch({
        context,
        results,
        term,
        type: Types.COLLECTION_SEARCH_FINISH
      })
    })
  }
}
