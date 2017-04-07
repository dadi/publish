import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import APIBridge from 'lib/api-bridge-client'
import {batchActions} from 'lib/redux'
import {setRemoteDocument} from 'actions/documentActions'

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
    // We use the APIBridge bundler because we might need to run more than
    // one query.
    const bundler = APIBridge.Bundler()

    // This is the main one, where we retrieve the list of documents.
    bundler.add(
      APIBridge(api, true)
        .in(collection)
        .limitTo(count)
        .goToPage(page)
        .sortBy(sortBy || 'createdAt', sortOrder || 'desc')
        .where(filters)
        .find()
    )

    // If we're on a nested document, we need to retrieve the parent too.
    if (referencedField) {
      bundler.add(
        APIBridge(api, true)
          .in(parentCollection)
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

        actions.push(setRemoteDocument(document, false))
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

export function clearDocumentList () {
  return {
    type: Types.CLEAR_DOCUMENT_LIST
  }
}
