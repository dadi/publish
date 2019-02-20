import 'fetch'
import * as Constants from 'lib/constants'
import * as Types from 'actions/actionTypes'
import apiBridgeClient from 'lib/api-bridge-client'
import {batchActions} from 'lib/redux'
import {setNotification} from 'actions/appActions'
import {setRemoteDocument} from 'actions/documentActions'
import {visibleFieldList} from 'lib/fields'

export function clearDocumentList () {
  return {
    type: Types.CLEAR_DOCUMENT_LIST
  }
}

export function deleteDocuments ({api, collection, ids}) {
  return (dispatch, getState) => {
    const apiBridge = apiBridgeClient({
      accessToken: getState().user.accessToken,
      api,
      collection
    }).whereFieldIsOneOf('_id', ids)

    dispatch(
      setDocumentListStatus(Constants.STATUS_DELETING, ids.length)
    )

    apiBridge.delete().then(response => {
      dispatch({
        ids,
        type: Types.DELETE_DOCUMENTS
      })
    })
  }
}

export function deleteMedia ({api, ids}) {
  return (dispatch, getState) => {
    dispatch(
      setDocumentListStatus(Constants.STATUS_DELETING, ids.length)
    )

    let bearerToken = getState().user.accessToken
    let url = `${api.host}:${api.port}/media`
    let body = JSON.stringify({
      query: {
        _id: {
          $in: ids
        }
      }
    })

    fetch(url, {
      body,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      method: 'DELETE'
    }).then(response => {
      if (response.ok) {
        return dispatch(
          setDocumentListStatus(Constants.STATUS_IDLE)
        )
      }

      return Promise.reject(response)
    })
    .catch(error => {
      dispatch(
        setDocumentListStatus(Constants.STATUS_FAILED, error)
      )
    })
  }
}

function fetchDocuments ({
  api,
  collection,
  count,
  fields,
  filters,
  page,
  parentDocumentId,
  parentCollection,
  referencedField,
  sortBy,
  sortOrder
}) {
  return (dispatch, getState) => {
    let currentDocument = getState().document
    let currentDocumentId = currentDocument &&
      currentDocument.remote &&
      currentDocument.remote._id
    let parentQuery = Promise.resolve()

    // If we're on a nested document, we need to retrieve the parent too.
    if (
      referencedField &&
      parentCollection &&
      parentDocumentId &&
      currentDocumentId !== parentDocumentId
    ) {
      parentQuery = apiBridgeClient({
        accessToken: getState().user.accessToken,
        api,
        collection: parentCollection
      }).whereFieldIsEqualTo(
        '_id',
        parentDocumentId
      ).find()
    }

    return parentQuery.then(response => {
      let parentDocument = response && response.results && response.results[0]

      if (response && !parentDocument) {
        return Promise.reject(404)
      }

      let collectionSettings = (collection && collection.settings) || {}
      let sort = [
        sortBy || collectionSettings.sort || '_createdAt',
        sortOrder || (collectionSettings.sortOrder === 1 ? 'asc' : 'desc') || 'desc'
      ]
      let listQuery

      if (collection.IS_MEDIA_BUCKET || collection === Constants.MEDIA_COLLECTION) {
        listQuery = apiBridgeClient({
          accessToken: getState().user.accessToken,
          api
        }).inMedia()
      } else {
        listQuery = apiBridgeClient({
          accessToken: getState().user.accessToken,
          api,
          collection,
          fields
        })
      }

      listQuery = listQuery.goToPage(page)
        .sortBy(...sort)
        .where(filters)
        .find()

      return listQuery
    })
  }
}

export function fetchDocumentsForListView ({
  api,
  collection,
  count,
  fields,
  filters,
  page,
  parentDocumentId,
  parentCollection,
  referencedField,
  sortBy,
  sortOrder
}) {
  return (dispatch, getState) => {
    dispatch(
      setDocumentListStatus(Constants.STATUS_LOADING)
    )

    return fetchDocuments({
      api,
      collection,
      count,
      fields,
      filters,
      page,
      parentCollection,
      parentDocumentId,
      referencedField,
      sortBy,
      sortOrder
    })(dispatch, getState).then(response => {
      let actions = [
        setDocumentList(response, filters)
      ]

      // TODO: reinstate
      // if (parentDocument) {
      //   actions.push(
      //     setRemoteDocument(parentDocument, {
      //       forceUpdate: false
      //     })
      //   )
      // }

      dispatch(batchActions(actions))
    }).catch(error => {
      dispatch(
        setDocumentListStatus(Constants.STATUS_FAILED, error)
      )
    })
  }
}

export function fetchDocumentsForExport ({
  api,
  collection,
  count,
  filters,
  page,
  sortBy,
  sortOrder
}) {
  return (dispatch, getState) => {
    return fetchDocuments({
      api,
      collection,
      count,
      fields: Object.keys(collection.fields),
      filters,
      page,
      sortBy,
      sortOrder
    })(dispatch, getState).then(response => {
      let headers = {}
      let itemsFormatted = []

      Object.keys(response.results[0]).forEach(key => {
        headers[key] = `"${key}"`
      })

      response.results.forEach(item => {
        let formattedItem = {}

        Object.keys(item).forEach(key => {
          formattedItem[key] = `"${item[key]}"`
        })

        itemsFormatted.push(formattedItem)
      })

      exportCSVFile(headers, itemsFormatted, collection.name)
    }).catch(error => {
      console.log('error :', error)
    })
  }
}

function convertToCSV (objArray) {
  let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
  let str = ''

  for (let i = 0; i < array.length; i++) {
    let line = ''

    for (let index in array[i]) {
      if (line !== '') {
        line += ','
      }

      line += array[i][index]
    }

    str += line + '\r\n'
  }

  return str
}

function exportCSVFile (headers, items, fileTitle) {
  if (headers) {
    items.unshift(headers)
  }

  let jsonObject = JSON.stringify(items)
  let csv = convertToCSV(jsonObject)
  let exportedFilename = fileTitle + '.csv' || 'export.csv'
  let blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})

  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae)
  } else {
    let link = document.createElement('a')

    if (link.download !== undefined) {
      // Browsers that support HTML5 download attribute
      let url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', exportedFilename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}

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

export function setDocumentListStatus (status, data) {
  return {
    data,
    status,
    type: Types.SET_DOCUMENT_LIST_STATUS
  }
}

export function saveMediaDocuments ({
  api,
  files
}) {
  return (dispatch, getState) => {
    dispatch(
      setDocumentListStatus(Constants.STATUS_SAVING)
    )

    uploadMedia({
      api,
      bearerToken: getState().user.accessToken,
      files
    })
    .then(response => {
      dispatch(
        setDocumentListStatus(Constants.STATUS_IDLE)
      )
    })
    .catch(error => {
      dispatch(
        setDocumentListStatus(Constants.STATUS_FAILED, error)
      )
    })
  }
}

export function uploadMedia ({
  api,
  bearerToken,
  files
}) {
  let url = `${api.host}:${api.port}/media/upload`
  let body = new FormData()

  files.forEach((file, index) => {
    body.append(`file${index}`, file)
  })

  return fetch(url, {
    body,
    headers: {
      Authorization: `Bearer ${bearerToken}`
    },
    method: 'POST'
  }).then(response => response.json())
}
