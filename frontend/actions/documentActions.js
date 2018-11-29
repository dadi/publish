import 'fetch'
import * as Constants from 'lib/constants'
import * as LocalStorage from 'lib/local-storage'
import * as Types from 'actions/actionTypes'
import * as userActions from 'actions/userActions'
import {batchActions} from 'lib/redux'
import {uploadMedia} from 'actions/documentsActions'
import apiBridgeClient from 'lib/api-bridge-client'

export function clearRemoteDocument () {
  return {
    type: Types.CLEAR_REMOTE_DOCUMENT
  }
}

export function discardUnsavedChanges ({
  collection
}) {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKey({
      path: collection.path,
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
    let apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      collection
    })

    // Are we dealing with a media document?
    if (collection.IS_MEDIA_BUCKET) {
      apiBridge = apiBridge.inMedia()
    }

    apiBridge = apiBridge.whereFieldIsEqualTo('_id', id)

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
  documentId,
  path,
  state
}) {
  // If we're editing an existing document, its ID is used as the local
  // storage key. Otherwise, we'll use the collection path.
  if (documentId) {
    return documentId
  }

  if (state && state.document.remote) {
    return state.document.remote._id
  }

  return path
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
  documentId
}) {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKey({
      documentId,
      path: collection.path,
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
  documentId
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

    // Handling Reference and Media fields.
    let referenceQueue = Object.keys(payload).map(field => {
      let schema = collection.fields[field]

      // We're only interested in fields that have an entry in the collection
      // schema, have a truthy value in the document and are of type Reference
      // or Media.
      if (
        !schema ||
        !payload[field] ||
        !['Media', 'Reference'].includes(schema.type)
      ) {
        return
      }

      let schemaSettings = schema.settings || {}
      let referencedDocuments = Array.isArray(payload[field]) ?
          payload[field] :
          [payload[field]]
      let referenceLimit = (
        schemaSettings.limit !== undefined &&
        schemaSettings.limit > 0
      ) ? schemaSettings.limit : Infinity
      let isMediaReference = schema.type === 'Reference' &&
        schemaSettings.collection === Constants.MEDIA_COLLECTION
      let isMedia = schema.type === 'Media'

      if (isMediaReference || isMedia) {
        return uploadMedia({
          api,
          bearerToken: getState().user.accessToken,
          files: referencedDocuments.map(document => document._file)
        }).then(({results}) => {
          if (isMediaReference) {
            return results.map(result => result._id)
          }

          return results.map(result => ({
            _id: result._id
          }))
        }).then(reference => {
          payload[field] = referenceLimit > 1 ? reference : reference[0]
        })
      } else {
        let reference = referencedDocuments
          .map(document => document._id)
          .filter(Boolean)

        payload[field] = referenceLimit > 1 ? reference : reference[0]
      }
    })

    Promise.all(referenceQueue).then(() => {
      apiBridge = isUpdate ?
        apiBridge.update(payload) :
        apiBridge.create(payload)

      return apiBridge.then(response => {
        if (response.results && response.results.length) {
          dispatch(setRemoteDocument(response.results[0], {
            clearLocal: true,
            forceUpdate: true
          }))

          // We've successfully saved the document, so we now need to clear
          // the local storage key corresponding to the unsaved document for
          // the given collection path.
          const localStorageKey = isUpdate ?
            documentId :
            collection.path

          LocalStorage.clearDocument(localStorageKey)
        } else {
          dispatch(
            setRemoteDocumentStatus(Constants.STATUS_FAILED)
          )
        }
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

export function saveMedia ({
  api,
  document,
  documentId
}) {
  return (dispatch, getState) => {
    dispatch(
      setRemoteDocumentStatus(Constants.STATUS_SAVING)
    )

    let bearerToken = getState().user.accessToken
    let url = `${api.host}:${api.port}/media/${documentId}`

    fetch(url, {
      body: JSON.stringify(document),
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      method: 'PUT'
    }).then(response => {
      if (!response.ok) {
        return Promise.reject(response)
      }

      return response.json()
    }).then(response => {
      dispatch(
        setRemoteDocument(response.results[0], {
          clearLocal: true,
          forceUpdate: true
        })
      )

      // We've successfully saved the document, so we now need to clear
      // the local storage key corresponding to the unsaved document for
      // the given collection path.
      LocalStorage.clearDocument(documentId)
    })
    .catch(response => {
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
export function startNewDocument ({collection}) {
  return (dispatch, getState) => {
    let currentCollection = getState().document.collection

    if (
      currentCollection.database !== collection.database ||
      currentCollection.slug !== collection.slug ||
      currentCollection.version !== collection.version
    ) {
      let localStorageKey = getLocalStorageKey({
        path: collection.path
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

export function updateLocalDocument ({
  meta = {},
  path,
  persistInLocalStorage = true,
  update = {}
} = {}) {
  return (dispatch, getState) => {
    let newLocal = Object.assign({}, getState().document.local, update)
    let newFieldsNotPersistedInLocalStorage = persistInLocalStorage ?
      getState().document.fieldsNotPersistedInLocalStorage :
      getState().document.fieldsNotPersistedInLocalStorage.concat(Object.keys(update))
    let localStorageKey = getLocalStorageKey({
      path,
      state: getState()
    })

    writeDocumentToLocalStorage({
      document: newLocal,
      fieldsNotPersistedInLocalStorage: newFieldsNotPersistedInLocalStorage,
      key: localStorageKey,
      state: getState()
    })

    dispatch({
      meta,
      persistInLocalStorage,
      type: Types.UPDATE_LOCAL_DOCUMENT,
      update
    })
  }
}

function uploadMediaToSignedURL (api, signedUrl, content) {
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
