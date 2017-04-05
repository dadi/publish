import * as Types from 'actions/actionTypes'

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
