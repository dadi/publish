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

export function deleteMedia ({api, collection, ids}) {
  return (dispatch, getState) => {
    fetch(
      `${api.host}:${api.port}/media/${ids[0]}`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getState().user.accessToken}`
        },
        method: 'DELETE'
      }
    )
    .then(
      response => response.json()
    )
    .then(
      response => {
        dispatch(
          setDocumentListStatus(Constants.STATUS_DELETING, ids.length)
        )
        dispatch({
          ids,
          type: Types.DELETE_DOCUMENTS
        })
      }
    )
    .catch(err =>
      dispatch(
        setRemoteDocumentStatus(Constants.STATUS_FAILED)
      )
    )
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

      if (collection._media || (collection === Constants.MEDIA_COLLECTION)) {
        let mediaBucket = typeof collection._media === 'string' ?
          collection._media :
          undefined

        listQuery = apiBridgeClient({
          accessToken: getState().user.accessToken,
          api
        }).inMedia(mediaBucket)
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
