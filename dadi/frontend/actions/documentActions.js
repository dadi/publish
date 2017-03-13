import * as Types from 'actions/actionTypes'

export function setRemoteDocument(document, currentCollection) {
  return {
    type: Types.SET_REMOTE_DOCUMENT,
    currentCollection,
    document
  }
}

export function setRemoteDocumentStatus(status) {
  return {
    type: Types.SET_REMOTE_DOCUMENT_STATUS,
    status
  }
}

export function clearRemoteDocument() {
  return {
    type: Types.CLEAR_REMOTE_DOCUMENT
  }
}

export function setFieldErrorStatus(field, value, error) {
  return {
    type: Types.SET_FIELD_ERROR_STATUS,
    field,
    value,
    error
  }
}

export function updateLocalDocument(data) {
  return {
    type: Types.UPDATE_LOCAL_DOCUMENT,
    data
  }
}
