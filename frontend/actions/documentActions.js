import * as Types from 'actions/actionTypes'

export function startNewDocument() {
  return {
    type: Types.START_NEW_DOCUMENT
  }
}

export function setRemoteDocument(document) {
  return {
    type: Types.SET_REMOTE_DOCUMENT,
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

export function setErrorsFromRemoteApi(errors) {
  return {
    type: Types.SET_ERRORS_FROM_REMOTE_API,
    errors
  }
}

export function updateLocalDocument(data) {
  return {
    type: Types.UPDATE_LOCAL_DOCUMENT,
    data
  }
}
