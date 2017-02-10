import * as types from './actionTypes'

export function setDocumentList (documents) {
  return {
    type: types.SET_DOCUMENT_LIST,
    documents
  }
}

