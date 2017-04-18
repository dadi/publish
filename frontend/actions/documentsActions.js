import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'
import {batchActions} from 'lib/redux'
import {setNotification} from 'actions/appActions'
import {setRemoteDocument} from 'actions/documentActions'

export function clearDocumentList () {
  return {
    type: Types.CLEAR_DOCUMENT_LIST
  }
}

export function deleteDocuments ({api, collection, ids}) {
  return (dispatch) => {
    const apiBridge = apiBridgeClient(api)
      .in(collection.name)
      .whereFieldIsOneOf('_id', ids)

    const newStatus = ids.length > 1 ?
      Constants.STATUS_DELETING_MULTIPLE :
      Constants.STATUS_DELETING_SINGLE

    dispatch(setDocumentListStatus(newStatus))

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
  return (dispatch) => {
    // We use the API Bridge bundler because we might need to run more than
    // one query.
    const bundler = apiBridgeClient.getBundler()

    // This is the main one, where we retrieve the list of documents.
    let parentQuery = apiBridgeClient(api, true)
      .goToPage(page)
      .sortBy(sortBy || 'createdAt', sortOrder || 'desc')
      .where(filters)

    if (collection.isMediaCollection) {
      parentQuery = parentQuery.inMedia()
    } else {
      parentQuery = parentQuery.in(collection.name)
    }

    bundler.add(parentQuery.find())

    // If we're on a nested document, we need to retrieve the parent too.
    if (referencedField && parentCollection) {
      bundler.add(
        apiBridgeClient(api, true)
          .in(parentCollection.name)
          .whereFieldIsEqualTo('_id', parentDocumentId)
          .find()
      )
    }

    dispatch(setDocumentListStatus(Constants.STATUS_LOADING))

    bundler.run().then(response => {
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

export function setDocumentListStatus (status) {
  return {
    status,
    type: Types.SET_DOCUMENT_LIST_STATUS
  }
}
