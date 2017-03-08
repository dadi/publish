import * as Types from 'actions/actionTypes'

export function setDocument(document, currentCollection) {
  return {
    type: Types.SET_DOCUMENT,
    currentCollection,
    document
  }
}

export function setDocumentStatus(status) {
  return {
    type: Types.SET_DOCUMENT_STATUS,
    status
  }
}

export function clearDocument() {
  return {
    type: Types.CLEAR_DOCUMENT
  }
}
