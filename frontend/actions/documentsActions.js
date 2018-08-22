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
    const sort = [
      sortBy || collection.settings.sort || 'createdAt',
      sortOrder || (collection.settings.sortOrder === 1 ? 'asc' : 'desc') || 'desc'
    ]

    let queries = []

    // This is the main one, where we retrieve the list of documents.
    let parentQuery

    if (collection === Constants.MEDIA_COLLECTION) {
      parentQuery = apiBridgeClient({
        api
      }).inMedia()
    } else {
      const fields = visibleFieldList({fields: collection.fields, view: 'list'})

      parentQuery = apiBridgeClient({
        accessToken: getState().user.accessToken,
        api,
        collection,
        fields
      })
    }

    parentQuery = parentQuery.goToPage(page)
      .sortBy(...sort)
      .where(filters)
      .find()

    queries.push(parentQuery)

    // If we're on a nested document, we need to retrieve the parent too.
    if (referencedField && parentCollection) {
      queries.push(
        apiBridgeClient({
          accessToken: getState().user.accessToken,
          api,
          collection: parentCollection
        }).whereFieldIsEqualTo(
          '_id',
          parentDocumentId
        ).find()
      )
    }

    dispatch(
      setDocumentListStatus(Constants.STATUS_LOADING)
    )

    Promise.all(queries).then(response => {
      const documentList = response[0]

      let actions = [
        setDocumentList(documentList, filters)
      ]

      if (referencedField) {
        const document = response[1].results[0]

        actions.push(setRemoteDocument(document, {
          forceUpdate: false
        }))
      }

      dispatch(batchActions(actions))
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
