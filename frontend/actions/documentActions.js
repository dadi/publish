import 'fetch'
import * as Constants from 'lib/constants'
import * as LocalStorage from 'lib/local-storage'
import * as Types from 'actions/actionTypes'
import {batchActions} from 'lib/redux'
import apiBridgeClient from 'lib/api-bridge-client'
import userActions from 'actions/userActions'

export function clearRemoteDocument () {
  return {
    type: Types.CLEAR_REMOTE_DOCUMENT
  }
}

export function discardUnsavedChanges ({
  collection,
  group
}) {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKey({
      collection,
      group,
      state: getState()
    })

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
  return (dispatch, getState) => {
    const apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      collection
    }).whereFieldIsEqualTo('_id', id)

    if (fields) {
      apiBridge.useFields(fields)
    }

    // Set loading status.
    dispatch(
      setRemoteDocumentStatus(Constants.STATUS_LOADING)
    )

    apiBridge.find().then(response => {
      if (response.results.length === 0) {
        return Promise.reject(404)
      }

      dispatch(
        setRemoteDocument(response.results[0])
      )
    }).catch(error => {
      dispatch(
        setRemoteDocumentStatus(Constants.STATUS_FAILED, error)
      )
    })
  }
}

function getLocalStorageKey ({
  collection,
  documentId,
  group,
  state
}) {
  // If we're editing an existing document, its ID is used as the local
  // storage key. Otherwise, we'll use a hash of the current group and
  // collection.
  if (documentId) {
    return documentId
  }

  if (state && state.document.remote) {
    return state.document.remote._id
  }

  return JSON.stringify({collection, group})
}

export function registerSaveAttempt (saveMode) {
  let actions = [
    {
      type: Types.ATTEMPT_SAVE_DOCUMENT
    },
    userActions.updateLocalUser(`data.${Constants.FIELD_SAVE_OPTIONS}`, saveMode)
  ]

  return (dispatch, getState) => {
    dispatch(
      batchActions(actions)
    )

    dispatch(userActions.saveUser())
  }
}

export function registerUserLeavingDocument ({
  collection,
  documentId,
  group
}) {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKey({
      collection,
      documentId,
      group,
      state: getState()
    })

    writeDocumentToLocalStorage({
      key: localStorageKey,
      state: getState()
    })

    dispatch({
      type: Types.USER_LEAVING_DOCUMENT
    })
  }
}

export function saveDocument ({
  api,
  collection,
  document,
  documentId,
  group,
  urlCollection
}) {
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
      accessToken: getState().user.accessToken,
      api,
      collection
    })

    dispatch(
      setRemoteDocumentStatus(Constants.STATUS_SAVING)
    )

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
      const booleanFields = Object.keys(collection.fields)
        .filter(fieldName => {
          const field = collection.fields[fieldName]

          return field.required && field.type === 'Boolean'
        })

      booleanFields.forEach(booleanField => {
        if (payload[booleanField] === undefined) {
          payload[booleanField] = false
        }
      })
    }

    // Handling reference fields.
    let referenceQueue = []
    let referenceQueueMap = []

    // We iterate through the payload and find reference fields.
    Object.keys(payload).forEach(field => {
      const fieldSchema = collection.fields[field]

      if (!fieldSchema) return

      const referencedCollection = fieldSchema.settings && fieldSchema.settings.collection

      // We're only interested in the field if its value is truthy. If it's
      // null, it's good as it is.
      if (payload[field] && fieldSchema.type === 'Reference') {
        const referencedDocument = payload[field]
        const referencedDocuments = Array.isArray(referencedDocument) ?
            referencedDocument : [referencedDocument]
        const referenceLimit = (
          fieldSchema.settings &&
          fieldSchema.settings.limit !== undefined &&
          fieldSchema.settings.limit > 0
        ) ? fieldSchema.settings.limit : Infinity

        // Is this a reference to a media collection?
        if (referencedCollection === Constants.MEDIA_COLLECTION) {
          payload[field] = referencedDocuments.map((document, index) => {
            // If this is an existing media item, we simply grab its ID.
            if (document._id) {
              return document._id
            }

            // Otherwise, we need to upload the file.
            referenceQueue.push(
              apiBridgeClient({
                accessToken: getState().user.accessToken,
                api
              }).inMedia().getSignedUrl({
                contentLength: document.contentLength,
                fileName: document.fileName,
                mimetype: document.mimetype
              })
            )

            referenceQueueMap.push({
              field,
              index,
              mediaUpload: true
            })

            return document
          })
        } else {
          const referencedCollectionSchema = referencedCollection &&
            api.collections.find(collection => {
              return collection.slug === referencedCollection
            })

          // If the referenced collection doesn't exist, there's nothing we can do.
          if (!referencedCollectionSchema) return

          let referenceDocumentIds = []

          referencedDocuments.forEach(document => {
            // The document already exists, we need to update it.
            if (document._id) {
              referenceDocumentIds.push(document._id)
            } else {

              // The document does not exist, we need to create it.
            }
          })

          payload[field] = referenceLimit > 1 ? referenceDocumentIds : referenceDocumentIds[0]
        }
      }
    })

    Promise.all(referenceQueue).then(responses => {
      let uploadQueue = []

      // `responses` contains an array of API responses resulting from updating
      // or creationg referenced documents. The names of the fields they relate
      // to are defined in `referenceQueueMap`.
      responses.forEach((response, index) => {
        const queueMapEntry = referenceQueueMap[index]
        const referenceField = queueMapEntry.field
        const referenceLimit = queueMapEntry.limit

        // If this bundle entry is a media upload, we're not done yet. The
        // bundle response gave us a signed URL, but we still need to upload
        // the file and add the resulting ID to the final payload.
        if (queueMapEntry.mediaUpload) {
          dispatch(
            setRemoteDocumentStatus(Constants.STATUS_SAVING)
          )

          const mediaUpload = uploadMedia(
            api,
            response.url,
            payload[referenceField][queueMapEntry.index]
          ).then(uploadResponse => {
            if (uploadResponse.results && uploadResponse.results.length) {
              payload[referenceField][queueMapEntry.index] = uploadResponse.results[0]._id
            }
          })

          uploadQueue.push(mediaUpload)
        } else if (response.results) {
          payload[referenceField] = referenceLimit === 1 ?
            response.results[0]._id :
            payload[referenceField].concat(response.results.map(document => {
              return document._id
            }))
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

            // We've successfully saved the document, so we now need to clear
            // the local storage key corresponding to the unsaved document for
            // the given group/collection pair.
            const localStorageKey = isUpdate ?
              documentId : JSON.stringify({
                collection: urlCollection,
                group
              })

            LocalStorage.clearDocument(localStorageKey)
          } else {
            dispatch(
              setRemoteDocumentStatus(Constants.STATUS_FAILED)
            )
          }
        })
      }).catch(response => {
        if (response.errors && response.errors.length) {
          dispatch(
            setErrorsFromRemoteAPI(response.errors)
          )
        } else {
          dispatch(
            setRemoteDocumentStatus(Constants.STATUS_FAILED)
          )
        }
      })
    }).catch(err => {
      dispatch(
        setRemoteDocumentStatus(Constants.STATUS_FAILED)
      )
    })
  }
}

export function setDocumentLanguage (language) {
  return {
    language,
    type: Types.SET_DOCUMENT_LANGUAGE
  }
}

export function setDocumentPeers (peers) {
  return {
    peers,
    type: Types.SET_DOCUMENT_PEERS
  }
}

export function setErrorsFromRemoteAPI (errors) {
  return {
    errors,
    type: Types.SET_ERRORS_FROM_REMOTE_API
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
  let localStorageKey = remote._id

  if (clearLocal && localStorageKey) {
    LocalStorage.clearDocument(localStorageKey)
  }

  let fromLocalStorage = LocalStorage.readDocument(localStorageKey)

  return {
    clearLocal,
    fieldsNotInLocalStorage,
    forceUpdate,
    fromLocalStorage,
    remote,
    type: Types.SET_REMOTE_DOCUMENT
  }
}

/**
 * Set Remote document status
 * @param {String} status Status from Constants
 */
export function setRemoteDocumentStatus (status, data) {
  return {
    data,
    status,
    type: Types.SET_REMOTE_DOCUMENT_STATUS
  }
}

/**
 * Start New Document
 * @return {Function} State dispatcher
 */
export function startNewDocument ({collection, group}) {
  return (dispatch, getState) => {
    let currentCollection = getState().document.collection

    if (
      currentCollection.database !== collection.database ||
      currentCollection.slug !== collection.slug ||
      currentCollection.version !== collection.version
    ) {
      let localStorageKey = getLocalStorageKey({
        collection: collection.slug,
        group
      })
      let document = LocalStorage.readDocument(localStorageKey) || {}

      dispatch({
        collection: {
          database: collection.database,
          slug: collection.slug,
          version: collection.version
        },
        document,
        type: Types.START_NEW_DOCUMENT
      })
    }
  }
}

export function updateLocalDocument (change, {
  collection,
  group,
  persistInLocalStorage = true
} = {}) {
  return (dispatch, getState) => {
    let newLocal = Object.assign({}, getState().document.local, change)
    let newFieldsNotPersistedInLocalStorage = persistInLocalStorage ?
      getState().document.fieldsNotPersistedInLocalStorage :
      getState().document.fieldsNotPersistedInLocalStorage.concat(Object.keys(change))
    let localStorageKey = getLocalStorageKey({
      collection,
      group,
      state: getState()
    })

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
