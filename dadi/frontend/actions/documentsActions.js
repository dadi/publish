import * as Types from 'actions/actionTypes'

export function setDocumentList({documents, sortBy, sortOrder}, currentCollection) {
  return {
    type: Types.SET_DOCUMENT_LIST,
    documents,
    sortBy,
    sortOrder,
    currentCollection
  }
}

export function setDocumentListStatus(status) {
  return {
    type: Types.SET_DOCUMENT_LIST_STATUS,
    status
  }
}

export function clearDocumentList() {
  return {
    type: Types.CLEAR_DOCUMENT_LIST
  }
}
