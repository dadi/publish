import * as types from 'actions/actionTypes'

export function setDocumentLoadingStatus(isLoading) {
  return {
    type: types.SET_DOCUMENT_LOADING_STATUS,
    isLoading
  }
}

export function clearDocumentList() {
  return {
    type: types.CLEAR_DOCUMENT_LIST
  }
}

export function setDocumentList({documents, collection, sortBy, sortOrder}) {
  return {
    type: types.SET_DOCUMENT_LIST,
    documents,
    collection,
    sortBy,
    sortOrder
  }
}

export function setDocument(docIsLoading, data) {
  return {
    type: types.SET_DOCUMENT,
    docIsLoading,
    data
  }
}
