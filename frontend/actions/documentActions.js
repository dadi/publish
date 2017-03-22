import * as Types from 'actions/actionTypes'

export function startNewDocument() {
  return {
    type: Types.START_NEW_DOCUMENT
  }
}

export function setRemoteDocument(document) {
  return {
    document,
    type: Types.SET_REMOTE_DOCUMENT
  }
}

export function setRemoteDocumentStatus(status) {
  return {
    status,
    type: Types.SET_REMOTE_DOCUMENT_STATUS
  }
}

export function clearRemoteDocument() {
  return {
    type: Types.CLEAR_REMOTE_DOCUMENT
  }
}

export function setFieldErrorStatus(field, value, error) {
  return {
    error,
    field,
    type: Types.SET_FIELD_ERROR_STATUS,
    value
  }
}

export function setErrorsFromRemoteApi(errors) {
  return {
    errors,
    type: Types.SET_ERRORS_FROM_REMOTE_API
  }
}

export function updateLocalDocument(data) {
  return {
    data,
    type: Types.UPDATE_LOCAL_DOCUMENT
  }
}
