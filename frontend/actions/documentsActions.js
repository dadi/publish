import * as Types from 'actions/actionTypes'

export function setDocumentList(documents) {
  return {
    documents,
    type: Types.SET_DOCUMENT_LIST
  }
}

export function setDocumentListStatus(status) {
  return {
    status,
    type: Types.SET_DOCUMENT_LIST_STATUS
  }
}

export function clearDocumentList() {
  return {
    type: Types.CLEAR_DOCUMENT_LIST
  }
}
