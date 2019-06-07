import * as Types from 'actions/actionTypes'

export function setDocumentSelection({key, selection}) {
  return dispatch => {
    // We need to ensure only valid documents are added to the selection.
    const documents = selection.filter(document => {
      return document && typeof document._id === 'string'
    })

    dispatch({
      key,
      selectedDocuments: documents,
      type: Types.SET_DOCUMENT_SELECTION
    })
  }
}
