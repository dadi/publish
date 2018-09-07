import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'
import {batchActions} from 'lib/redux'
import {setNotification} from 'actions/appActions'
import {setRemoteMedia} from 'actions/mediaActions'
import {visibleFieldList} from 'lib/fields'

export function clearMediaList () {
  return {
    type: Types.CLEAR_DOCUMENT_LIST
  }
}

export function deleteMedias ({api, bucket, ids}) {
  return (dispatch, getState) => {
    const apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      bucket
    }).whereFieldIsOneOf('_id', ids)

    dispatch(
      setMediaListStatus(Constants.STATUS_DELETING, ids.length)
    )

    apiBridge.delete().then(response => {
      dispatch({
        ids,
        type: Types.DELETE_DOCUMENTS
      })
    })
  }
}

export function fetchMedias ({
  api,
  bucket,
  count,
  filters,
  page,
  parentMediaId,
  parentBucket,
  referencedField,
  sortBy,
  sortOrder
}) {
  return (dispatch, getState) => {
    dispatch(
      setMediaListStatus(Constants.STATUS_LOADING)
    )

    let currentMedia = getState().media
    let currentMediaId = currentMedia &&
      currentMedia.remote &&
      currentMedia.remote._id
    let parentQuery = Promise.resolve()

    // If we're on a nested media, we need to retrieve the parent too.
    if (
      referencedField &&
      parentBucket &&
      parentMediaId &&
      currentMediaId !== parentMediaId
    ) {
      parentQuery = apiBridgeClient({
        accessToken: getState().user.accessToken,
        api,
        bucket: parentBucket
      }).whereFieldIsEqualTo(
        '_id',
        parentMediaId
      ).find()
    }

    return parentQuery.then(response => {
      let parentMedia = response && response.results && response.results[0]

      if (response && !parentMedia) {
        return Promise.reject(404)
      }

      let bucketSettings = (bucket && bucket.settings) || {}
      let sort = [
        sortBy || bucketSettings.sort || '_createdAt',
        sortOrder || (bucketSettings.sortOrder === 1 ? 'asc' : 'desc') || 'desc'
      ]
      let listQuery

      if (bucket === Constants.MEDIA_COLLECTION) {
        listQuery = apiBridgeClient({
          accessToken: getState().user.accessToken,
          api
        }).inMedia()
      } else {
        const fields = visibleFieldList({fields: bucket.fields, view: 'list'})

        listQuery = apiBridgeClient({
          accessToken: getState().user.accessToken,
          api,
          bucket,
          fields
        })
      }

      listQuery = listQuery.goToPage(page)
        .sortBy(...sort)
        .where(filters)
        .find()

      return listQuery.then(response => {
        let actions = [
          setMediaList(response, filters)
        ]

        if (parentMedia) {
          actions.push(
            setRemoteMedia(parentMedia, {
              forceUpdate: false
            })
          )
        }

        dispatch(batchActions(actions))
      })
    }).catch(error => {
      dispatch(
        setMediaListStatus(Constants.STATUS_FAILED, error)
      )
    })
  }
}

export function setMediaList (medias, query) {
  return {
    medias,
    query,
    type: Types.SET_DOCUMENT_LIST
  }
}

export function setMediaSelection (selectedMedias) {
  return {
    selectedMedias,
    type: Types.SET_DOCUMENT_SELECTION
  }
}

export function setMediaListStatus (status, data) {
  return {
    data,
    status,
    type: Types.SET_DOCUMENT_LIST_STATUS
  }
}
