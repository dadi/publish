import * as types from 'actions/actionTypes'

export function setDocumentLoadingStatus(isLoading) {
  return {
    type: types.SET_DOCUMENT_LOADING_STATUS,
    isLoading
  }
}

export function setDocumentList(documents, collection) {
  return {
    type: types.SET_DOCUMENT_LIST,
    documents,
    collection
  }
}

export function setDocument(docIsLoading, data) {
  return {
    type: types.SET_DOCUMENT,
    docIsLoading,
    data
  }
}


