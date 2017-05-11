import 'fetch'

import * as Constants from 'lib/constants'
import * as LocalStorage from 'lib/local-storage'
import * as Types from 'actions/actionTypes'

import apiBridgeClient from 'lib/api-bridge-client'

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

export function fetchDocument ({
  api,
  collection,
  id,
  fields
}) {
  return (dispatch) => {
    const apiBridge = apiBridgeClient({
      api,
      collection
    }).whereFieldIsEqualTo('_id', id)

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

function getLocalStorageKeyFromState (state) {
  return state.router.locationBeforeTransitions.pathname
}

export function registerSaveAttempt () {
  return {
    type: Types.ATTEMPT_SAVE_DOCUMENT
  }
}

export function registerUserLeavingDocument () {
  return (dispatch, getState) => {
    writeDocumentToLocalStorage({
      state: getState()
    })

    dispatch({
      type: Types.USER_LEAVING_DOCUMENT
    })
  }
}

export function saveDocument ({api, collection, document, documentId}) {
  // A method that returns `true`:
  // 1) If the objects are different and `false`
  // 2) If they are identical. 
  // 
  // At the moment, we're using JSON.stringify() to
  // create a hash of each object and compare that literally, but we can
  // change this method later if we want to.
  const diff = (object1, object2) => {
    return JSON.stringify(object1) !== JSON.stringify(object2)
  }

  return (dispatch, getState) => {
    const currentRemote = getState().document.remote
    const isUpdate = Boolean(documentId)

    let payload = {}
    let apiBridge = apiBridgeClient({
      api,
      collection
    })

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

      // When creating a document, we need to attach to the payload any Boolean
      // fields that are required.
      const booleanFields = Object.keys(collection.fields).filter(fieldName => {
        const field = collection.fields[fieldName]

        return field.required && field.type === 'Boolean'
      })

      booleanFields.forEach(booleanField => {
        if (typeof payload[booleanField] === 'undefined') {
          payload[booleanField] = false
        }
      })
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

      // We're only interested in the field if its value is truthy. If it's
      // null, it's good as it is.
      if (payload[field] && fieldSchema.type === 'Reference') {
        const referencedDocument = payload[field]

        // Is this a reference to a media collection?
        if (referencedCollection === Constants.MEDIA_COLLECTION) {
          const mediaDocument = payload[field]

          // If this is an existing media item, we simply grab its ID.
          if (mediaDocument._id) {
            payload[field] = mediaDocument._id
          } else {
            // Otherwise, we need to upload the file.
            referenceBundler.add(
              apiBridgeClient({
                api,
                inBundle: true
              }).inMedia().getSignedUrl({
                contentLength: mediaDocument.contentLength,
                fileName: mediaDocument.fileName,
                mimetype: mediaDocument.mimetype
              })
            )

            referenceBundlerMap.push({
              field,
              mediaUpload: true
            })
          }
        } else {
          const referencedCollectionSchema = referencedCollection &&
            api.collections.find(collection => {
              return collection.slug === referencedCollection
            })

          // If the referenced collection doesn't exist, there's nothing we can do.
          if (!referencedCollectionSchema) return

          // The document already exists, we need to update it.
          if (referencedDocument._id) {
            referenceBundler.add(
              apiBridgeClient({
                api,
                collection: referencedCollectionSchema,
                inBundle: true
              }).whereFieldIsEqualTo('_id', referencedDocument._id)
                .update(referencedDocument)
            )

            referenceBundlerMap.push({
              field
            })
          } else {

            // The document does not exist, we need to create it.
          }
        }
      }
    })

    referenceBundler.run().then(responses => {
      let uploadQueue = []

      // `responses` contains an array of API responses resulting from updating
      // or creationg referenced documents. The names of the fields they relate
      // to are defined in `referenceBundlerMap`.
      responses.forEach((response, index) => {
        const bundlerMapEntry = referenceBundlerMap[index]
        const referenceField = bundlerMapEntry.field

        // If this bundle entry is a media upload, we're not done yet. The
        // bundle response gave us a signed URL, but we still need to upload
        // the file and add the resulting ID to the final payload.
        if (bundlerMapEntry.mediaUpload) {
          const mediaUpload = uploadMedia(api, response.url, payload[referenceField])
            .then(uploadResponse => {
              if (uploadResponse.results && uploadResponse.results.length) {
                payload[referenceField] = uploadResponse.results[0]._id
              }
            })

          uploadQueue.push(mediaUpload)
        } else if (response.results && response.results[0]) {
          payload[referenceField] = response.results[0]._id
        }
      })

      // Wait for any media uploads to be finished.
      return Promise.all(uploadQueue).then(() => {
        // The payload is ready, we can attach it to API Bridge.
        if (isUpdate) {
          apiBridge = apiBridge.update(payload)
        } else {
          apiBridge = apiBridge.create(payload)
        }

        return apiBridge.then(response => {
          if (response.results && response.results.length) {
            dispatch(setRemoteDocument(response.results[0], {
              clearLocal: true,
              forceUpdate: true
            }))
          } else {
            dispatch(setRemoteDocumentStatus(Constants.STATUS_FAILED))
          }
        })
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

/**
 * Set Remove Document
 * Apply remote document to LocalStorage
 * @param {Object} remote Remote document
 * @param {Boolean} options.clearLocal 
 * @param {Array}   options.fieldsNotInLocalStorage A list of new fields
 * @param {[type]}  options.forceUpdate Force an update
 */
export function setRemoteDocument (remote, {
  clearLocal = false,
  fieldsNotInLocalStorage = [],
  forceUpdate = true
} = {}) {
  return (dispatch, getState) => {
    let localStorageKey = remote._id

    if (clearLocal && localStorageKey) {
      LocalStorage.clearDocument(localStorageKey)
    }

    let fromLocalStorage = LocalStorage.readDocument(localStorageKey)

    dispatch({
      fieldsNotInLocalStorage,
      forceUpdate,
      fromLocalStorage,
      remote,
      type: Types.SET_REMOTE_DOCUMENT
    })
  }
}

/**
 * Set Remote document status
 * @param {String} status Status from Constants
 */
export function setRemoteDocumentStatus (status) {
  return {
    status,
    type: Types.SET_REMOTE_DOCUMENT_STATUS
  }
}

/**
 * Start New Document
 * @return {Function} State dispatcher
 */
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

export function updateLocalDocument (change, {
  persistInLocalStorage = true
} = {}) {
  return (dispatch, getState) => {
    let newLocal = Object.assign({}, getState().document.local, change)
    let newFieldsNotPersistedInLocalStorage = persistInLocalStorage ?
      getState().document.fieldsNotPersistedInLocalStorage :
      getState().document.fieldsNotPersistedInLocalStorage.concat(Object.keys(change))

    let localStorageKey

    if (getState().document.remote) {
      localStorageKey = getState().document.remote._id
    }

    writeDocumentToLocalStorage({
      document: newLocal,
      fieldsNotPersistedInLocalStorage: newFieldsNotPersistedInLocalStorage,
      key: localStorageKey,
      state: getState()
    })

    dispatch({
      change,
      persistInLocalStorage,
      type: Types.UPDATE_LOCAL_DOCUMENT
    })
  }
}

function uploadMedia (api, signedUrl, content) {
  const url = `${api.host}:${api.port}${signedUrl}`
  const payload = new FormData()

  payload.append('file', content._file)

  return fetch(url, {
    body: payload,
    method: 'POST'
  }).then(response => response.json())
}

function writeDocumentToLocalStorage ({
  document,
  fieldsNotPersistedInLocalStorage,
  key,
  state
} = {}) {
  document = document || state.document.local
  fieldsNotPersistedInLocalStorage = fieldsNotPersistedInLocalStorage ||
    state.document.fieldsNotPersistedInLocalStorage
  key = key || getLocalStorageKeyFromState(state)

  if (!document) return

  let filteredDocument = {}

  Object.keys(document).forEach(field => {
    if (!fieldsNotPersistedInLocalStorage.includes(field)) {
      filteredDocument[field] = document[field]
    }
  })

  if (Object.keys(filteredDocument).length > 0) {
    LocalStorage.writeDocument(key, filteredDocument)
  }
}
