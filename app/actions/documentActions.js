import 'unfetch/polyfill'
import * as Constants from 'lib/constants'
import * as LocalStorage from 'lib/local-storage'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'

const CACHE_TTL = 5000

/**
 * Deletes a set of documents from the remote API.
 *
 * @param  {Object} collection  Collection schema
 * @param  {String} contentKey  Content key
 * @param  {Array}  ids         Document IDs
 */
export function deleteDocuments({collection, contentKey, ids}) {
  if (collection.IS_MEDIA_BUCKET) {
    return deleteMediaDocuments({contentKey, ids})
  }

  return (dispatch, getState) => {
    const {api} = getState().app.config
    const apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      collection
    }).whereFieldIsOneOf('_id', ids)

    dispatch({
      collection,
      ids,
      key: contentKey,
      type: Types.DELETE_DOCUMENTS_START
    })

    apiBridge
      .delete()
      .then(() => {
        dispatch({
          collection,
          ids,
          key: contentKey,
          type: Types.DELETE_DOCUMENTS_SUCCESS
        })
      })
      .catch(error => {
        dispatch({
          collection,
          data: error,
          ids,
          key: contentKey,
          type: Types.DELETE_DOCUMENTS_FAILURE
        })
      })
  }
}

/**
 * Deletes a set of media documents from the remote API.
 *
 * @param  {String} contentKey  Content key
 * @param  {Array}  ids         Document IDs
 */
export function deleteMediaDocuments({contentKey, ids}) {
  return (dispatch, getState) => {
    dispatch({
      collection: Constants.MEDIA_COLLECTION_SCHEMA,
      ids,
      key: contentKey,
      type: Types.DELETE_DOCUMENTS_START
    })

    const {api} = getState().app.config
    const {accessToken} = getState().user
    const url = `${api.host}:${api.port}/media`
    const body = JSON.stringify({
      query: {
        _id: {
          $in: ids
        }
      }
    })

    fetch(url, {
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      method: 'DELETE'
    })
      .then(response => {
        if (response.ok) {
          return dispatch({
            collection: Constants.MEDIA_COLLECTION_SCHEMA,
            ids,
            key: contentKey,
            type: Types.DELETE_DOCUMENTS_SUCCESS
          })
        }

        return Promise.reject(response)
      })
      .catch(error => {
        dispatch({
          collection: Constants.MEDIA_COLLECTION_SCHEMA,
          data: error,
          ids,
          key: contentKey,
          type: Types.DELETE_DOCUMENTS_FAILURE
        })
      })
  }
}

/**
 * Discards any local changes to a given document, returning it to the
 * remote state.
 *
 * @param  {String} contentKey  Content key
 */
export function discardUnsavedChanges({contentKey}) {
  return dispatch => {
    LocalStorage.clearDocument(contentKey)

    dispatch({
      key: contentKey,
      type: Types.DISCARD_UNSAVED_CHANGES
    })
  }
}

/**
 * Fetches a single document from the remote API.
 *
 * @param  {Boolean} bypassCache  Whether to force a fetch, even if the
 *    document exists in cache.
 * @param  {String}  contentKey   Content key
 * @param  {Object}  collection   Collection schema
 * @param  {String}  id           Document ID
 */
export function fetchDocument({
  bypassCache = false,
  contentKey,
  collection,
  id
}) {
  return (dispatch, getState) => {
    const {app, document} = getState()
    const {api} = app.config
    const existingKey = document[contentKey]
    const currentTs = Date.now()

    // Unless the `bypassCache` parameter is true, we try to fetch this from cache.
    // We do that if the cached data isn't older than CACHE_TTL.
    if (
      !bypassCache &&
      existingKey &&
      currentTs - existingKey.timestamp < CACHE_TTL
    ) {
      return
    }

    let apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      collection
    })

    // Are we dealing with a media document?
    if (collection.IS_MEDIA_BUCKET) {
      apiBridge = apiBridge.inMedia()
    }

    // Add ID filter.
    apiBridge = apiBridge.whereFieldIsEqualTo('_id', id)

    dispatch({
      key: contentKey,
      type: Types.LOAD_DOCUMENT_START
    })

    apiBridge
      .find()
      .then(({results}) => {
        if (results.length === 0) {
          return Promise.reject(404)
        }

        dispatch(
          setDocument({
            contentKey,
            document: results[0],
            timestamp: currentTs
          })
        )
      })
      .catch(error => {
        dispatch({
          key: contentKey,
          data: error,
          type: Types.LOAD_DOCUMENT_FAILURE
        })
      })
  }
}

/**
 * Fetches a list of documents from the remote API.
 *
 * @param  {Boolean} bypassCache  Whether to force a fetch, even if the
 *    content key exists in cache.
 * @param  {String}  contentKey   Content key
 * @param  {Object}  collection   Collection schema
 * @param  {Array}   fields       Array of fields to include
 * @param  {Object}  filters      Filters to apply
 * @param  {Number}  page         Page number
 * @param  {String}  sortBy       Name of the field to sort by
 * @param  {String}  sortOrder    Sort order (i.e. "asc" or "desc")
 */
export function fetchDocumentList({
  bypassCache = false,
  contentKey,
  collection,
  fields,
  filters,
  page,
  sortBy,
  sortOrder
}) {
  return (dispatch, getState) => {
    const {app, documents} = getState()
    const {api} = app.config
    const existingKey = documents[contentKey]
    const currentTs = Date.now()

    // Unless the `bypassCache` parameter is true, we try to fetch this from cache.
    // We do that if the cached data isn't older than CACHE_TTL.
    if (
      !bypassCache &&
      existingKey &&
      !existingKey.dirty &&
      currentTs - existingKey.timestamp < CACHE_TTL
    ) {
      return
    }

    dispatch(
      setDocumentListStatus({
        contentKey,
        status: Constants.STATUS_LOADING
      })
    )

    const {settings = {}} = collection
    const sort = [
      sortBy || settings.sort || '_createdAt',
      sortOrder || (settings.sortOrder === 1 ? 'asc' : 'desc') || 'desc'
    ]

    let query

    if (
      collection.IS_MEDIA_BUCKET ||
      collection === Constants.MEDIA_COLLECTION
    ) {
      query = apiBridgeClient({
        accessToken: getState().user.accessToken,
        api
      }).inMedia()
    } else {
      query = apiBridgeClient({
        accessToken: getState().user.accessToken,
        api,
        collection,
        fields
      })
    }

    query = query
      .goToPage(page)
      .sortBy(...sort)
      .where(filters)
      .find()

    return query
      .then(response => {
        const {metadata, results} = response

        dispatch(
          setDocumentList({
            contentKey,
            metadata: metadata,
            results: results,
            timestamp: currentTs
          })
        )
      })
      .catch(error => {
        dispatch(
          setDocumentListStatus({
            contentKey,
            data: error,
            status: Constants.STATUS_FAILED
          })
        )
      })
  }
}

/**
 * Signals that the user has tried to save a document.
 *
 * @param  {String} contentKey  Content key
 * @param  {String} mode        Save mode (one of SAVE_ACTION_* constants)
 */
export function registerSaveAttempt({contentKey, mode}) {
  return {
    mode,
    key: contentKey,
    type: Types.ATTEMPT_SAVE_DOCUMENT
  }
}

/**
 * Registers a callback function to be fired for a given field before the
 * document is saved. The callback may choose to modify the value of the field
 * before it's sent to API.
 *
 * @param  {Function} contentKey  Callback function
 * @param  {String}   contentKey  Content key
 * @param  {String}   fieldName   The name of the field
 */
export function registerSaveCallback({callback, contentKey, fieldName}) {
  return {
    callback,
    fieldName,
    key: contentKey,
    type: Types.REGISTER_SAVE_CALLBACK
  }
}

/**
 * Registers a callback function to be fired for a given field every time it
 * needs to be validated, overriding the default validation method introduced
 * by the API validator module.
 * The callback should return a resolved Promise if validation passes, or a
 * rejected Promise with an error message if validation fails.
 *
 * @param  {Function} contentKey  Callback function
 * @param  {String}   contentKey  Content key
 * @param  {String}   fieldName   The name of the field
 */
export function registerValidationCallback({callback, contentKey, fieldName}) {
  return {
    callback,
    fieldName,
    key: contentKey,
    type: Types.REGISTER_VALIDATION_CALLBACK
  }
}

/**
 * Saves a document, as well as any associated referenced documents, to the
 * remote API.
 *
 * @param  {String}  contentKey   Content key
 * @param  {Object}  collection   Collection schema
 * @param  {String}  documentId   The ID of the existing document, if updating
 */
export function saveDocument({contentKey, collection, documentId}) {
  if (collection.IS_MEDIA_BUCKET) {
    return saveMediaDocument({
      contentKey,
      documentId
    })
  }

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
    const {api} = getState().app.config
    const currentDocument = getState().document[contentKey] || {}
    const {local, remote, saveCallbacks} = currentDocument
    const isUpdate = Boolean(documentId)

    let payload = {}
    let apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      collection
    })

    dispatch({
      key: contentKey,
      type: Types.SAVE_DOCUMENT_START
    })

    if (isUpdate) {
      Object.keys(local).forEach(field => {
        if (diff(local[field], remote[field])) {
          payload[field] = local[field]
        }
      })

      apiBridge = apiBridge.whereFieldIsEqualTo('_id', documentId)
    } else {
      payload = Object.assign({}, remote, local)

      // When creating a document, we need to look for Boolean fields that are
      // required and not set in the payload – they appear as `false` in the
      // interface, but their value is actually `undefined`. We must set them
      // to `false` before submitting.
      Object.keys(collection.fields).forEach(fieldName => {
        const field = collection.fields[fieldName]

        if (
          payload[fieldName] === undefined &&
          field.required &&
          field.type === 'Boolean'
        ) {
          payload[fieldName] = false
        }
      })
    }

    // Firing any registered `onSave` callbacks.
    Object.keys(payload).forEach(field => {
      // (!) TO DO: adapt to `i18n.languageField`
      const [name] = field.split(':')

      if (typeof saveCallbacks[name] === 'function') {
        payload[field] = saveCallbacks[name]({
          value: payload[field]
        })
      }
    })

    // Handling Reference and Media fields.
    const referenceQueue = Object.keys(payload).map(field => {
      const schema = collection.fields[field]

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

      const schemaSettings = schema.settings || {}
      const referencedDocuments = Array.isArray(payload[field])
        ? payload[field]
        : [payload[field]]
      const referenceLimit =
        schemaSettings.limit !== undefined && schemaSettings.limit > 0
          ? schemaSettings.limit
          : Infinity
      const isMediaReference =
        schema.type === 'Reference' &&
        schemaSettings.collection === Constants.MEDIA_COLLECTION
      const isMedia = schema.type === 'Media'

      if (isMediaReference || isMedia) {
        // This array will work as a stack that stores the indexes of documents
        // that must be uploaded first. When the upload is complete, this array
        // can be used to reconstruct `referencedDocuments` with the result of
        // the uploads.
        let uploadIndexes = []
        let documentsToUpload = referencedDocuments.filter(
          (document, index) => {
            if (document._id === undefined) {
              uploadIndexes.push(index)

              return true
            }
          }
        )
        let uploadJob = Promise.resolve(referencedDocuments)

        // Are there any documents that need to be uploaded first?
        if (documentsToUpload.length > 0) {
          uploadJob = uploadMedia({
            api,
            bearerToken: getState().user.accessToken,
            files: documentsToUpload.map(document => document._file)
          }).then(({results}) => {
            results.forEach(uploadedDocument => {
              const index = uploadIndexes.shift()

              referencedDocuments[index] = uploadedDocument
            })

            return referencedDocuments
          })
        }

        return uploadJob
          .then(results => {
            if (isMediaReference) {
              return results.map(result => result._id)
            }

            return results.map(result => ({
              _id: result._id
            }))
          })
          .then(reference => {
            payload[field] = referenceLimit > 1 ? reference : reference[0]
          })
      } else {
        const reference = referencedDocuments
          .map(document => document._id)
          .filter(Boolean)

        payload[field] = referenceLimit > 1 ? reference : reference[0]
      }
    })

    Promise.all(referenceQueue)
      .then(() => {
        apiBridge = isUpdate
          ? apiBridge.update(payload)
          : apiBridge.create(payload)

        return apiBridge
          .then(({results}) => {
            if (results && results.length > 0) {
              dispatch({
                data: results[0],
                key: contentKey,
                type: Types.SAVE_DOCUMENT_SUCCESS
              })

              // We've successfully saved the document, so we now need to clear
              // the local storage key corresponding to the unsaved document for
              // the given collection path.
              LocalStorage.clearDocument(contentKey)
            } else {
              dispatch({
                key: contentKey,
                type: Types.SAVE_DOCUMENT_FAILURE
              })
            }
          })
          .catch(({errors}) => {
            dispatch({
              data: errors,
              key: contentKey,
              type: Types.SAVE_DOCUMENT_FAILURE
            })

            let dataUpdate = {}
            let errorUpdate = {}

            errors.forEach(error => {
              if (error.field) {
                dataUpdate[error.field] = null
                errorUpdate[error.field] = error.message
              }
            })

            dispatch(
              updateLocalDocument({
                contentKey,
                error: errorUpdate,
                update: dataUpdate
              })
            )
          })
      })
      .catch(error => {
        dispatch({
          data: error,
          key: contentKey,
          type: Types.SAVE_DOCUMENT_FAILURE
        })
      })
  }
}

/**
 * Saves changes to a document locally, using LocalStorage. Before saving, it
 * diffs each field (using JSON.stringify) against the remote document, and
 * only saves if at least one of the fields actually changed.
 *
 * @param  {String}  contentKey   Content key
 */
export function saveDocumentLocally({contentKey}) {
  return (_, getState) => {
    const document = getState().document[contentKey] || {}
    const {local, remote, saveCallbacks} = document

    let needsSaving = false

    const payload =
      local &&
      Object.keys(local).reduce((payload, field) => {
        // (!) TO DO: adapt to `i18n.languageField`
        const [name] = field.split(':')
        const value =
          typeof saveCallbacks[name] === 'function'
            ? saveCallbacks[name]({value: local[field]})
            : local[field]

        payload[field] = value

        const hasChanged = remote
          ? JSON.stringify(value) !== JSON.stringify(remote[field])
          : true

        needsSaving = needsSaving || hasChanged

        return payload
      }, {})

    if (needsSaving) {
      LocalStorage.writeDocument(contentKey, payload)
    }
  }
}

/**
 * Saves a media document to the remote API.
 *
 * @param  {String}  contentKey   Content key
 * @param  {Object}  collection   Collection schema
 * @param  {String}  documentId   The ID of the media document
 */
export function saveMediaDocument({contentKey, documentId}) {
  return (dispatch, getState) => {
    dispatch({
      key: contentKey,
      type: Types.SAVE_DOCUMENT_START
    })

    const {api} = getState().app.config
    const {local} = getState().document[contentKey] || {}
    const bearerToken = getState().user.accessToken
    const url = `${api.host}:${api.port}/media/${documentId}`

    fetch(url, {
      body: JSON.stringify(local),
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json'
      },
      method: 'PUT'
    })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(response)
        }

        return response.json()
      })
      .then(({results}) => {
        dispatch({
          data: results[0],
          key: contentKey,
          type: Types.SAVE_DOCUMENT_SUCCESS
        })

        // We've successfully saved the document, so we now need to clear
        // the local storage key corresponding to the document.
        LocalStorage.clearDocument(contentKey)
      })
      .catch(error => {
        dispatch({
          data: error,
          key: contentKey,
          type: Types.SAVE_DOCUMENT_FAILURE
        })
      })
  }
}

/**
 * Takes a local document, augments it with any local storage data found for
 * the content key, and sends both to the store.
 *
 * @param  {Object}  document     Local document
 * @param  {String}  contentKey   Content key
 * @param  {Number}  timestamp    Timestamp of the operation
 */
export function setDocument({document, contentKey: key, timestamp} = {}) {
  const fromLocalStorage = LocalStorage.readDocument(key)

  return {
    document,
    key,
    fromLocalStorage,
    timestamp,
    type: Types.LOAD_DOCUMENT_SUCCESS
  }
}

/**
 * Populates a list of documents for a given content key.
 *
 * @param  {String}  contentKey   Content key
 * @param  {Object}  metadata     List metadata
 * @param  {Array}   results      Documents
 * @param  {Number}  timestamp    Timestamp of the operation
 */
export function setDocumentList({contentKey, metadata, results, timestamp}) {
  return {
    key: contentKey,
    metadata,
    results,
    timestamp,
    type: Types.SET_DOCUMENT_LIST
  }
}

/**
 * Sets the status of a document list.
 *
 * @param  {String}  contentKey   Content key
 * @param  {Object}  data         Any associated data, such as errors
 * @param  {String}  status       Status code
 */
export function setDocumentListStatus({contentKey, data, status}) {
  return {
    data,
    key: contentKey,
    status,
    type: Types.SET_DOCUMENT_LIST_STATUS
  }
}

/**
 * Starts editing a new document.
 *
 * @param  {String}  contentKey   Content key
 */
export function startDocument({contentKey: key}) {
  const fromLocalStorage = LocalStorage.readDocument(key)

  return {
    key,
    fromLocalStorage,
    type: Types.START_NEW_DOCUMENT
  }
}

/**
 * Registers local changes to a document.
 *
 * @param  {String}  contentKey   Content key
 * @param  {Object}  error        Object containing any error states for the
 *    fields being updated
 * @param  {Object}  meta         Any associated metadata, not part of the value
 * @param  {Object}  update       Object containing the fields being updated as
 *    well as their values
 */
export function updateLocalDocument({
  contentKey: key,
  error = {},
  meta = {},
  update = {}
} = {}) {
  return {
    error,
    key,
    meta,
    type: Types.UPDATE_LOCAL_DOCUMENT,
    update
  }
}

/**
 * Uploads media files to the remote API.
 *
 * @param  {Object}  api          API configuration object
 * @param  {String}  bearerToken  API access token
 * @param  {Array}   files        Files to be uploaded
 */
function uploadMedia({api, bearerToken, files}) {
  const url = `${api.host}:${api.port}/media/upload`
  const body = new FormData()

  files.forEach((file, index) => {
    body.append(`file${index}`, file)
  })

  return fetch(url, {
    body,
    headers: {
      Authorization: `Bearer ${bearerToken}`
    },
    method: 'POST'
  }).then(response => response.json())
}

/**
 * Uploads a set of media files to the remote API.
 *
 * @param  {String}  contentKey   Content key
 * @param  {Array}   files        Files to upload
 */
export function uploadMediaDocuments({contentKey, files}) {
  return (dispatch, getState) => {
    const {app} = getState()
    const {api} = app.config

    dispatch({
      key: contentKey,
      type: Types.UPLOAD_MEDIA_START
    })

    uploadMedia({
      api,
      bearerToken: getState().user.accessToken,
      files
    })
      .then(() => {
        dispatch({
          key: contentKey,
          type: Types.UPLOAD_MEDIA_SUCCESS
        })
      })
      .catch(error => {
        dispatch({
          data: error,
          key: contentKey,
          type: Types.UPLOAD_MEDIA_FAILURE
        })
      })
  }
}
