import 'fetch'
import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import {fetchDocuments} from 'actions/documentsActions'
import {setRemoteDocumentStatus} from 'actions/documentActions'

export function deleteMedia ({api, bucket, ids}) {
  return (dispatch, getState) => {
    dispatch(
      setDocumentListStatus(Constants.STATUS_DELETING, ids.length)
    )

    Promise.all(ids.map(id => fetch(
      `${api.host}:${api.port}/media/${id}`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getState().user.accessToken}`
        },
        method: 'DELETE'
      }
    )))
    .then(() => dispatch({
      ids,
      type: Types.DELETE_DOCUMENTS
    }))
    .catch(() => dispatch(
      setRemoteDocumentStatus(Constants.STATUS_FAILED)
    ))
  }
}

export function uploadMediaToBucket ({
  api,
  bucket,
  files
}) {
  return (dispatch, getState) => {
    dispatch(
      setRemoteDocumentStatus(Constants.STATUS_SAVING)
    )

    Promise.all(Array.from(files).map(file => {
      const body = new FormData()

      body.append('file', file)

      fetch(
        `${api.host}:${api.port}/media/upload`,
        {
          body,
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${getState().user.accessToken}`
          },
          method: 'POST'
        }
      )
    }))
    .then(() => dispatch(
      fetchDocuments({
        api,
        collection: bucket
      })
    ))
    .catch(err =>
      dispatch(
        setRemoteDocumentStatus(Constants.STATUS_FAILED)
      )
    )
  }
}