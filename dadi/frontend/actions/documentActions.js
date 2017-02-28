import * as types from 'actions/actionTypes'

export function setDocumentList (listIsLoading, documents, collection) {
  return {
    type: types.SET_DOCUMENT_LIST,
    listIsLoading,
    documents,
    collection
  }
}

export function setDocument (docIsLoading, data) {
  return {
    type: types.SET_DOCUMENT,
    docIsLoading,
    data
  }
}

