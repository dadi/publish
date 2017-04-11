import * as Constants from 'lib/constants'
import * as LocalStorage from 'lib/local-storage'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'

function getLocalStorageKeyFromState (state) {
  return state.router.locationBeforeTransitions.pathname
}

export function clearRemoteDocument () {
  return {
    type: Types.CLEAR_REMOTE_DOCUMENT
  }
}

export function discardUnsavedChanges () {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKeyFromState(getState())

    LocalStorage.clearDocument(localStorageKey)

    dispatch({
      type: Types.DISCARD_UNSAVED_CHANGES
    })
  }
}

export function fetchDocument ({api, collection, id, fields}) {
  return (dispatch) => {
    const apiBridge = apiBridgeClient(api)
      .in(collection)
      .whereFieldIsEqualTo('_id', id)

    if (fields) {
      apiBridge.useFields(fields)
    }

    // Set loading status
    dispatch(setRemoteDocumentStatus(Constants.STATUS_LOADING))

    apiBridge.find().then(response => {
      if (response.results.length) {
        dispatch(setRemoteDocument(response.results[0]))
      } else {
        dispatch(setRemoteDocumentStatus(Constants.STATUS_NOT_FOUND))
      }
    }).catch(err => {
      dispatch(setRemoteDocumentStatus(Constants.STATUS_FAILED))
    })
  }
}

export function registerUserLeavingDocument () {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKeyFromState(getState())
    let localDocument = getState().document.local

    if (localDocument && Object.keys(localDocument).length > 0) {
      LocalStorage.writeDocument(localStorageKey, localDocument)
    }

    dispatch({
      type: Types.USER_LEAVING_DOCUMENT
    })
  }
}

export function saveDocument ({api, collection, document, documentId}) {
  // A method that returns `true` if the objects are different and `false`
  // if they are identical. At the moment, we're using JSON.stringify() to
  // create a hash of each object and compare that literally, but we can
  // change this method later if we want to.
  const diff = (object1, object2) => {
    return JSON.stringify(object1) !== JSON.stringify(object2)
  }

  return (dispatch, getState) => {
    const currentRemote = getState().document.remote
    const isUpdate = Boolean(documentId)

    let payload = {}
    let apiBridge = apiBridgeClient(api).in(collection.name)

    dispatch(setRemoteDocumentStatus(Constants.STATUS_SAVING))

    if (isUpdate) {
      Object.keys(document).forEach(field => {
        if (diff(document[field], currentRemote[field])) {
          payload[field] = document[field]
        }
      })

      apiBridge = apiBridge.whereFieldIsEqualTo('_id', documentId)
    } else {
      payload = Object.assign({}, currentRemote, document)
    }

    // Handling reference fields. We might need to run multiple queries, so
    // we use the API Bridge bundler.
    const referenceBundler = apiBridgeClient.getBundler()
    let referenceBundlerMap = []

    // We iterate through the payload and find reference fields.
    Object.keys(payload).forEach(field => {
      const fieldSchema = collection.fields[field]

      if (!fieldSchema) return

      const referencedCollection = fieldSchema.settings && fieldSchema.settings.collection

      // If the referenced collection isn't defined, there's nothing we can do.
      if (!referencedCollection) return

      // We're only interested in the field if its value is truthy. If it's
      // null, it's good as it is.
      if (payload[field] && fieldSchema.type === 'Reference') {
        const referencedDocument = payload[field]

        // The document already exists, we need to update it.
        if (referencedDocument._id) {
          referenceBundler.add(
            apiBridgeClient(api, true)
              .in(referencedCollection)
              .whereFieldIsEqualTo('_id', referencedDocument._id)
              .update(referencedDocument)
          )

          referenceBundlerMap.push(field)
        } else {

          // The document does not exist, we need to create it.
        }
      }
    })

    referenceBundler.run().then(responses => {
      // `responses` contains an array of API responses resulting from updating
      // or creationg referenced documents. The names of the fields they relate
      // to are defined in `referenceBundlerMap`.
      responses.forEach((response, index) => {
        if (response.results && response.results.length) {
          const referenceField = referenceBundlerMap[index]

          payload[referenceField] = response.results[0]._id
        }
      })

      // The payload is ready, we can attach it to API Bridge.
      if (isUpdate) {
        apiBridge = apiBridge.update(payload)
      } else {
        apiBridge = apiBridge.create(payload)
      }

      return apiBridge.then(response => {
        if (response.results && response.results.length) {
          dispatch(setRemoteDocument(response.results[0], true, true))
        } else {
          dispatch(setRemoteDocumentStatus(Constants.STATUS_FAILED))
        }
      }).catch(response => {
        if (response.errors && response.errors.length) {
          dispatch({
            errors: response.errors,
            type: Types.SET_ERRORS_FROM_REMOTE_API
          })
        } else {
          dispatch(setRemoteDocumentStatus(Constants.STATUS_FAILED))
        }
      })
    }).catch(err => {
      dispatch(setRemoteDocumentStatus(Constants.STATUS_FAILED))
    })
  }
}

export function setDocumentPeers (peers) {
  return {
    peers,
    type: Types.SET_DOCUMENT_PEERS
  }
}

export function setFieldErrorStatus (field, value, error) {
  return {
    error,
    field,
    type: Types.SET_FIELD_ERROR_STATUS,
    value
  }
}

export function setRemoteDocument (remote, forceUpdate = true, clearLocal = false) {
  return (dispatch, getState) => {
    let localDocument = null
    let localStorageKey = getLocalStorageKeyFromState(getState())

    if (clearLocal) {
      LocalStorage.clearDocument(localStorageKey)
    } else {
      localDocument = LocalStorage.readDocument(localStorageKey)
    }

    dispatch({
      forceUpdate,
      loadedFromLocalStorage: Boolean(localDocument),
      local: localDocument || {},
      remote,
      type: Types.SET_REMOTE_DOCUMENT
    })
  }
}

export function setRemoteDocumentStatus (status) {
  return {
    status,
    type: Types.SET_REMOTE_DOCUMENT_STATUS
  }
}

export function startNewDocument () {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKeyFromState(getState())
    let document = LocalStorage.readDocument(localStorageKey) || {}

    dispatch({
      document,
      type: Types.START_NEW_DOCUMENT
    })
  }
}

export function updateLocalDocument (change) {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKeyFromState(getState())
    let newLocal = Object.assign({}, getState().document.local, change)

    LocalStorage.writeDocument(localStorageKey, newLocal)

    dispatch({
      change,
      type: Types.UPDATE_LOCAL_DOCUMENT
    })
  }
}
