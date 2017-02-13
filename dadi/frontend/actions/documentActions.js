import * as types from './actionTypes'

export function setDocumentList (listIsLoading, documents) {
  return {
    type: types.SET_DOCUMENT_LIST,
    listIsLoading,
    documents
  }
}

export function setDocument (docIsLoading, data) {
  return {
    type: types.SET_DOCUMENT,
    docIsLoading,
    data
  }
}


