import 'fetch'
import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'
import {batchActions} from 'lib/redux'
import {setNotification} from 'actions/appActions'
import {setRemoteDocument} from 'actions/documentActions'
import {visibleFieldList} from 'lib/fields'

export function clearDocumentList () {
  return {
    type: Types.CLEAR_DOCUMENT_LIST
  }
}

export function deleteDocuments ({api, collection, ids}) {
  return (dispatch, getState) => {
    const apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      collection
    }).whereFieldIsOneOf('_id', ids)

    dispatch(
      setDocumentListStatus(Constants.STATUS_DELETING, ids.length)
    )

    apiBridge.delete().then(response => {
      dispatch({
        ids,
        type: Types.DELETE_DOCUMENTS
      })
    })
  }
}

export function deleteMedia ({api, ids}) {
  return (dispatch, getState) => {
    dispatch(
      setDocumentListStatus(Constants.STATUS_DELETING, ids.length)
    )

    let bearerToken = getState().user.accessToken
    let url = `${api.host}:${api.port}/media`
    let body = JSON.stringify({
      query: {
        _id: {
          $in: ids
        }
      }
    })

    fetch(url, {
      body,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE'
    }).then(response => {
      if (response.ok) {
        return dispatch(
          setDocumentListStatus(Constants.STATUS_IDLE)
        )
      }

      return Promise.reject(response)
    })
    .catch(error => {
      dispatch(
        setDocumentListStatus(Constants.STATUS_FAILED, error)
      )
    })
  }
}

export function fetchDocuments ({
  api,
  collection,
  count,
  filters,
  page,
  parentDocumentId,
  parentCollection,
  referencedField,
  sortBy,
  sortOrder
}) {
  return (dispatch, getState) => {
    dispatch(
      setDocumentListStatus(Constants.STATUS_LOADING)
    )

    let currentDocument = getState().document
    let currentDocumentId = currentDocument &&
      currentDocument.remote &&
      currentDocument.remote._id
    let parentQuery = Promise.resolve()

    // If we're on a nested document, we need to retrieve the parent too.
    if (
      referencedField &&
      parentCollection &&
      parentDocumentId &&
      currentDocumentId !== parentDocumentId
    ) {
      parentQuery = apiBridgeClient({
        accessToken: getState().user.accessToken,
        api,
        collection: parentCollection
      }).whereFieldIsEqualTo(
        '_id',
        parentDocumentId
      ).find()
    }

    return parentQuery.then(response => {
      let parentDocument = response && response.results && response.results[0]

      if (response && !parentDocument) {
        return Promise.reject(404)
      }

      let collectionSettings = (collection && collection.settings) || {}
      let sort = [
        sortBy || collectionSettings.sort || '_createdAt',
        sortOrder || (collectionSettings.sortOrder === 1 ? 'asc' : 'desc') || 'desc'
      ]
      let listQuery

      if (collection.IS_MEDIA_BUCKET || collection === Constants.MEDIA_COLLECTION) {
        listQuery = apiBridgeClient({
          accessToken: getState().user.accessToken,
          api
        }).inMedia()
      } else {
        const fields = visibleFieldList({fields: collection.fields, view: 'list'})

        listQuery = apiBridgeClient({
          accessToken: getState().user.accessToken,
          api,
          collection,
          fields
        })
      }

      listQuery = listQuery.goToPage(page)
        .sortBy(...sort)
        .where(filters)
        .find()

      return listQuery.then(response => {
        let actions = [
          setDocumentList(response, filters)
        ]

        if (parentDocument) {
          actions.push(
            setRemoteDocument(parentDocument, {
              forceUpdate: false
            })
          )
        }

        dispatch(batchActions(actions))
      })
    }).catch(error => {
      dispatch(
        setDocumentListStatus(Constants.STATUS_FAILED, error)
      )
    })
  }
}

export function setDocumentList (documents, query) {
  return {
    documents,
    query,
    type: Types.SET_DOCUMENT_LIST
  }
}

export function setDocumentSelection (selectedDocuments) {
  return {
    selectedDocuments,
    type: Types.SET_DOCUMENT_SELECTION
  }
}

export function setDocumentListStatus (status, data) {
  return {
    data,
    status,
    type: Types.SET_DOCUMENT_LIST_STATUS
  }
}

export function uploadMedia ({
  api,
  files
}) {
  return (dispatch, getState) => {
    dispatch(
      setDocumentListStatus(Constants.STATUS_SAVING)
    )

    let bearerToken = getState().user.accessToken
    let url = `${api.host}:${api.port}/media/upload`
    let body = new FormData()

    files.forEach((file, index) => {
      body.append(`file${index}`, file)
    })

    fetch(url, {
      body,
      headers: {
        Authorization: `Bearer ${bearerToken}`
      },
      method: 'POST'
    }).then(response => response.json()).then(response => {
      dispatch(
        setDocumentListStatus(Constants.STATUS_IDLE)
      )
    })
    .catch(error => {
      dispatch(
        setDocumentListStatus(Constants.STATUS_FAILED, error)
      )
    })
  }
}
