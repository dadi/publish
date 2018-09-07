import 'fetch'

import * as Constants from 'lib/constants'
import * as LocalStorage from 'lib/local-storage'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'

export function clearRemoteMedia () {
  return {
    type: Types.CLEAR_REMOTE_MEDIA
  }
}

export function discardUnsavedChanges ({
  bucket,
  group
}) {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKey({
      bucket,
      group,
      state: getState()
    })

    LocalStorage.clearMedia(localStorageKey)

    dispatch({
      type: Types.DISCARD_UNSAVED_CHANGES
    })
  }
}

export function fetchMedia ({
  api,
  bucket,
  id,
  fields
}) {
  return (dispatch, getState) => {
    const apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      bucket
    }).whereFieldIsEqualTo('_id', id)

    if (fields) {
      apiBridge.useFields(fields)
    }

    // Set loading status.
    dispatch(
      setRemoteMediaStatus(Constants.STATUS_LOADING)
    )

    apiBridge.find().then(response => {
      if (response.results.length === 0) {
        return Promise.reject(404)
      }

      dispatch(
        setRemoteMedia(response.results[0])
      )
    }).catch(error => {
      dispatch(
        setRemoteMediaStatus(Constants.STATUS_FAILED, error)
      )
    })
  }
}

function getLocalStorageKey ({
  bucket,
  mediaId,
  group,
  state
}) {
  // If we're editing an existing media, its ID is used as the local
  // storage key. Otherwise, we'll use a hash of the current group and
  // bucket.
  if (mediaId) {
    return mediaId
  }

  if (state && state.media.remote) {
    return state.media.remote._id
  }

  return JSON.stringify({bucket, group})
}

export function registerSaveAttempt () {
  return {
    type: Types.ATTEMPT_SAVE_MEDIA
  }
}

export function registerUserLeavingMedia ({
  bucket,
  mediaId,
  group
}) {
  return (dispatch, getState) => {
    let localStorageKey = getLocalStorageKey({
      bucket,
      group,
      mediaId,
      state: getState()
    })

    writeMediaToLocalStorage({
      key: localStorageKey,
      state: getState()
    })

    dispatch({
      type: Types.USER_LEAVING_MEDIA
    })
  }
}

export function saveMedia ({
  api,
  bucket,
  media,
  mediaId,
  group,
  urlBucket
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
    const currentRemote = getState().media.remote
    const isUpdate = Boolean(mediaId)

    let payload = {}
    let apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      bucket
    })

    dispatch(
      setRemoteMediaStatus(Constants.STATUS_SAVING)
    )

    if (isUpdate) {
      Object.keys(media).forEach(field => {
        if (diff(media[field], currentRemote[field])) {
          payload[field] = media[field]
        }
      })

      apiBridge = apiBridge.whereFieldIsEqualTo('_id', mediaId)
    } else {
      payload = Object.assign({}, currentRemote, media)

      // When creating a media, we need to attach to the payload any Boolean
      // fields that are required.
      const booleanFields = Object.keys(bucket.fields)
        .filter(fieldName => {
          const field = bucket.fields[fieldName]

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
      const fieldSchema = bucket.fields[field]

      if (!fieldSchema) return

      const referencedBucket = fieldSchema.settings && fieldSchema.settings.bucket

      // We're only interested in the field if its value is truthy. If it's
      // null, it's good as it is.
      if (payload[field] && fieldSchema.type === 'Reference') {
        const referencedMedia = payload[field]
        const referencedMedias = Array.isArray(referencedMedia) ?
            referencedMedia : [referencedMedia]
        const referenceLimit = (
          fieldSchema.settings &&
          fieldSchema.settings.limit !== undefined &&
          fieldSchema.settings.limit > 0
        ) ? fieldSchema.settings.limit : Infinity

        // Is this a reference to a media bucket?
        if (referencedBucket === Constants.MEDIA_BUCKET) {
          payload[field] = referencedMedias.map((media, index) => {
            // If this is an existing media item, we simply grab its ID.
            if (media._id) {
              return media._id
            }

            // Otherwise, we need to upload the file.
            referenceQueue.push(
              apiBridgeClient({
                accessToken: getState().user.accessToken,
                api
              }).inMedia().getSignedUrl({
                contentLength: media.contentLength,
                fileName: media.fileName,
                mimetype: media.mimetype
              })
            )

            referenceQueueMap.push({
              field,
              index,
              mediaUpload: true
            })

            return media
          })
        } else {
          const referencedBucketSchema = referencedBucket &&
            api.buckets.find(bucket => {
              return bucket.slug === referencedBucket
            })

          // If the referenced bucket doesn't exist, there's nothing we can do.
          if (!referencedBucketSchema) return

          let referenceMediaIds = []

          referencedMedias.forEach(media => {
            // The media already exists, we need to update it.
            if (media._id) {
              referenceMediaIds.push(media._id)
            } else {

              // The media does not exist, we need to create it.
            }
          })

          payload[field] = referenceLimit > 1 ? referenceMediaIds : referenceMediaIds[0]
        }
      }
    })

    Promise.all(referenceQueue).then(responses => {
      let uploadQueue = []

      // `responses` contains an array of API responses resulting from updating
      // or creationg referenced medias. The names of the fields they relate
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
            setRemoteMediaStatus(Constants.STATUS_SAVING)
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
            payload[referenceField].concat(response.results.map(media => {
              return media._id
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
            dispatch(setRemoteMedia(response.results[0], {
              clearLocal: true,
              forceUpdate: true
            }))

            // We've successfully saved the media, so we now need to clear
            // the local storage key corresponding to the unsaved media for
            // the given group/bucket pair.
            const localStorageKey = isUpdate ?
              mediaId : JSON.stringify({
                bucket: urlBucket,
                group
              })

            LocalStorage.clearMedia(localStorageKey)
          } else {
            dispatch(
              setRemoteMediaStatus(Constants.STATUS_FAILED)
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
            setRemoteMediaStatus(Constants.STATUS_FAILED)
          )
        }
      })
    }).catch(err => {
      dispatch(
        setRemoteMediaStatus(Constants.STATUS_FAILED)
      )
    })
  }
}

export function setMediaLanguage (language) {
  return {
    language,
    type: Types.SET_MEDIA_LANGUAGE
  }
}

export function setMediaPeers (peers) {
  return {
    peers,
    type: Types.SET_MEDIA_PEERS
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
 * Set Remove Media
 * Apply remote media to LocalStorage
 * @param {Object} remote Remote media
 * @param {Boolean} options.clearLocal
 * @param {Array}   options.fieldsNotInLocalStorage A list of new fields
 * @param {[type]}  options.forceUpdate Force an update
 */
export function setRemoteMedia (remote, {
  clearLocal = false,
  fieldsNotInLocalStorage = [],
  forceUpdate = true
} = {}) {
  let localStorageKey = remote._id

  if (clearLocal && localStorageKey) {
    LocalStorage.clearMedia(localStorageKey)
  }

  let fromLocalStorage = LocalStorage.readMedia(localStorageKey)

  return {
    clearLocal,
    fieldsNotInLocalStorage,
    forceUpdate,
    fromLocalStorage,
    remote,
    type: Types.SET_REMOTE_MEDIA
  }
}

/**
 * Set Remote media status
 * @param {String} status Status from Constants
 */
export function setRemoteMediaStatus (status, data) {
  return {
    data,
    status,
    type: Types.SET_REMOTE_MEDIA_STATUS
  }
}

/**
 * Start New Media
 * @return {Function} State dispatcher
 */
export function startNewMedia ({bucket, group}) {
  return (dispatch, getState) => {
    let currentBucket = getState().media.bucket

    if (
      currentBucket.database !== bucket.database ||
      currentBucket.slug !== bucket.slug ||
      currentBucket.version !== bucket.version
    ) {
      let localStorageKey = getLocalStorageKey({
        bucket: bucket.slug,
        group
      })
      let media = LocalStorage.readMedia(localStorageKey) || {}

      dispatch({
        bucket: {
          database: bucket.database,
          slug: bucket.slug,
          version: bucket.version
        },
        media,
        type: Types.START_NEW_MEDIA
      })
    }
  }
}

export function updateLocalMedia (change, {
  bucket,
  group,
  persistInLocalStorage = true
} = {}) {
  return (dispatch, getState) => {
    let newLocal = Object.assign({}, getState().media.local, change)
    let newFieldsNotPersistedInLocalStorage = persistInLocalStorage ?
      getState().media.fieldsNotPersistedInLocalStorage :
      getState().media.fieldsNotPersistedInLocalStorage.concat(Object.keys(change))
    let localStorageKey = getLocalStorageKey({
      bucket,
      group,
      state: getState()
    })

    writeMediaToLocalStorage({
      fieldsNotPersistedInLocalStorage: newFieldsNotPersistedInLocalStorage,
      key: localStorageKey,
      media: newLocal,
      state: getState()
    })

    dispatch({
      change,
      persistInLocalStorage,
      type: Types.UPDATE_LOCAL_MEDIA
    })
  }
}

function uploadMedia (api, signedUrl, content) {
  // Override default api DNS with public props so that
  // media can be uploaded even if API is behind a load balancer
  // or configured to use a private IP/host for performance purposes.
  const host = api.publicUrl ?
    `${api.publicUrl.protocol || 'http'}://${api.publicUrl.host}` :
    api.host
  const port = api.publicUrl ? api.publicUrl.port : api.port
  const url = `${host}:${port}${signedUrl}`
  const payload = new FormData()

  payload.append('file', content._file)

  return fetch(url, {
    body: payload,
    method: 'POST'
  }).then(response => response.json())
}

function writeMediaToLocalStorage ({
  media,
  fieldsNotPersistedInLocalStorage,
  key,
  state
} = {}) {
  media = media || state.media.local
  fieldsNotPersistedInLocalStorage = fieldsNotPersistedInLocalStorage ||
    state.media.fieldsNotPersistedInLocalStorage

  if (!media) return

  let filteredMedia = {}

  Object.keys(media).forEach(field => {
    if (!fieldsNotPersistedInLocalStorage.includes(field)) {
      filteredMedia[field] = media[field]
    }
  })

  if (Object.keys(filteredMedia).length > 0) {
    LocalStorage.writeMedia(key, filteredMedia)
  }
}
