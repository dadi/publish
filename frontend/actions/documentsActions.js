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
  return (dispatch) => {
    const apiBridge = apiBridgeClient({
      api,
      collection
    }).whereFieldIsOneOf('_id', ids)

    const newStatus = ids.length > 1 ?
      Constants.STATUS_DELETING_MULTIPLE :
      Constants.STATUS_DELETING_SINGLE

    dispatch(setDocumentListStatus(newStatus))

    apiBridge.delete().then(response => {
      dispatch({
        ids,
        type: Types.DELETE_DOCUMENTS
      })
    })
  }
}

export function fetchDocuments ({
  api,
  collection,
  count,
  filters,
  page,
  parentDocumentId,
  parentCollection,
  referencedField,
  sortBy,
  sortOrder
}) {
  return (dispatch) => {
    // We use the API Bridge bundler because we might need to run more than
    // one query.
    const bundler = apiBridgeClient.getBundler()

    // This is the main one, where we retrieve the list of documents.
    let parentQuery

    if (collection === Constants.MEDIA_COLLECTION) {
      parentQuery = apiBridgeClient({
        api,
        inBundle: true
      }).inMedia()
    } else {
      const fields = visibleFieldList({fields: collection.fields, view: 'list'})

      parentQuery = apiBridgeClient({
        api,
        collection,
        fields,
        inBundle: true
      })
    }

    parentQuery = parentQuery.goToPage(page)
      .sortBy(sortBy || 'createdAt', sortOrder || 'desc')
      .where(filters)
      .find()

    bundler.add(parentQuery)

    // If we're on a nested document, we need to retrieve the parent too.
    if (referencedField && parentCollection) {
      bundler.add(
        apiBridgeClient({
          api,
          collection: parentCollection,
          inBundle: true
        }).whereFieldIsEqualTo('_id', parentDocumentId)
          .find()
      )
    }

    dispatch(setDocumentListStatus(Constants.STATUS_LOADING))

    bundler.run().then(response => {
      const documentList = response[0]

      let actions = [
        setDocumentList(documentList, filters)
      ]

      if (referencedField) {
        const document = response[1].results[0]

        actions.push(setRemoteDocument(document, {
          forceUpdate: false
        }))
      }

      dispatch(batchActions(actions))
    })
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

export function setDocumentListStatus (status) {
  return {
    status,
    type: Types.SET_DOCUMENT_LIST_STATUS
  }
}
