import * as types from 'actions/actionTypes'

export function setDocumentList (listIsLoading, documents, documentCollection) {
  return {
    type: types.SET_DOCUMENT_LIST,
    listIsLoading,
    documents,
    documentCollection
  }
}

export function setDocument (docIsLoading, data) {
  return {
    type: types.SET_DOCUMENT,
    docIsLoading,
    data
  }
}


