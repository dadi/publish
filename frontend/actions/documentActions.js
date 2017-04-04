import * as Types from 'actions/actionTypes'

export function clearRemoteDocument () {
  return {
    type: Types.CLEAR_REMOTE_DOCUMENT
  }
}

export function discardUnsavedChanges (context) {
  return {
    context,
    type: Types.DISCARD_UNSAVED_CHANGES
  }
}

export function saveDocument (context, notification) {
  return {
    context,
    notification,
    type: Types.SAVE_DOCUMENT
  }
}

export function setDocumentPeers (peers) {
  return {
    peers,
    type: Types.SET_DOCUMENT_PEERS
  }
}

export function setErrorsFromRemoteApi (errors) {
  return {
    errors,
    type: Types.SET_ERRORS_FROM_REMOTE_API
  }
}

export function setFieldErrorStatus (field, value, error) {
  return {
    error,
    field,
    type: Types.SET_FIELD_ERROR_STATUS,
    value
  }
}

export function setRemoteDocument (document, context) {
  return {
    context,
    document,
    type: Types.SET_REMOTE_DOCUMENT
  }
}

export function setRemoteDocumentStatus (status) {
  return {
    status,
    type: Types.SET_REMOTE_DOCUMENT_STATUS
  }
}

export function startNewDocument (context) {
  return {
    context,
    type: Types.START_NEW_DOCUMENT
  }
}

export function updateLocalDocument (change, context) {
  return {
    change,
    context,
    type: Types.UPDATE_LOCAL_DOCUMENT
  }
}
