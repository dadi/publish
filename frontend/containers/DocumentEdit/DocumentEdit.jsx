'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {bindActionCreators} from 'redux'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as documentsActions from 'actions/documentsActions'
import * as routerActions from 'actions/routerActions'
import * as fieldComponents from 'lib/field-components'

import APIBridge from 'lib/api-bridge-client'
import {visibleFieldList, filterVisibleFields} from 'lib/fields'
import {buildUrl} from 'lib/router'
import {connectHelper} from 'lib/util'
import {Format} from 'lib/util/string'

import DocumentField from 'containers/DocumentField/DocumentField'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import SpinningWheel from 'components/SpinningWheel/SpinningWheel'
import TabbedFieldSections from 'components/TabbedFieldSections/TabbedFieldSections'

/**
 * The interface for editing a document.
 */
class DocumentEdit extends Component {
  static propTypes = {
    /**
      * The global actions object.
    */
    actions: proptypes.object,

    /**
     * The API to operate on.
     */
    api: proptypes.object,

    /**
     * The collection to operate on.
     */
    collection: proptypes.object,

    /**
     * The parent collection to operate on, when dealing with a reference field.
     */
    collectionParent: proptypes.object,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
    * A callback to be fired if the container wants to attempt changing the
    * page title.
    */
    onPageTitle: proptypes.func,

    /**
    * A callback responsible for rendering individual fields.
    */
    onRenderField: proptypes.func,

    /**
     * The name of a reference field currently being edited.
     */
    referencedField: proptypes.string,

    /**
     * The current active section (if any).
     */
    section: proptypes.string,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.hasFetched = false
  }

  componentDidUpdate(previousProps, previousState) {
    const {
      actions,
      collection,
      documentId,
      state
    } = this.props
    const {document, documents} = state
    const {
      document: previousDocument,
      documents: previousDocuments
    } = previousProps.state

    // Are there unsaved changes?
    if (
      !previousDocument.local &&
      document.local &&
      document.hasLoadedFromLocalStorage
    ) {
      const notification = {
        dismissAfterSeconds: false,
        fadeAfterSeconds: 5,
        message: 'You have unsaved changes',
        options: {
          'Discard them?': actions.discardUnsavedChanges.bind(this, {
            collection
          })
        }
      }

      actions.setNotification(notification)
    }

    // If there's an error, stop here.
    if (this.hasFetched && document.remoteError) {
      return
    }

    // There's no document ID, so it means we're creating a new document.
    if (!documentId) {
      if (collection) {
        actions.startNewDocument({
          collection
        })
      }

      return
    }

    // We're editing an existing document. We need to fetch it from the remote
    // API if:
    //
    // - We're not already in the process of fetching one AND
    // - There is no document in the store OR the document id has changed AND
    // - All APIs have collections
    const remoteDocumentHasChanged = document.remote &&
      (documentId !== document.remote._id)
    const needsFetch = !document.remote || remoteDocumentHasChanged
    const hasJustDeleted = previousDocuments.isDeleting && !documents.isDeleting

    if (
      !document.isLoading &&
      !hasJustDeleted &&
      needsFetch &&
      collection &&
      state.api.apis.length > 0
    ) {
      this.fetchDocument()
    }
  }

  componentWillMount() {
    const {
      actions,
      collection,
      documentId,
      group,
      onGetRoutes,
      state
    } = this.props

    this.userLeavingDocumentHandler = this.handleUserLeavingDocument.bind(this)

    window.addEventListener('beforeunload', this.userLeavingDocumentHandler)

    if (state.document.remote && state.document.remote._id !== documentId) {
      actions.clearRemoteDocument()
    }
  }  

  componentWillUnmount() {
    const {
      actions,
      collection,
      documentId
    } = this.props

    window.removeEventListener('beforeunload', this.userLeavingDocumentHandler)
  }

  // Fetches a document from the remote API
  fetchDocument() {
    const {
      actions,
      api,
      collection,
      collectionParent,
      documentId,
      state
    } = this.props

    // As far as the fetch method is concerned, we're only interested in the
    // collection of the main document, not the referenced one.
    let parentCollection = collectionParent || collection
    let query = {
      api,
      collection: parentCollection,
      id: documentId
    }

    actions.fetchDocument(query)

    this.hasFetched = true
  }

  handleUserLeavingDocument() {
    const {
      actions,
      collection,
      documentId,
      group,
      state
    } = this.props

    actions.registerUserLeavingDocument({
      collection,
      documentId
    })
  }

  render() {
    const {
      collection,
      documentId,
      onBuildBaseUrl,
      onRender,
      referencedField,
      section,
      state
    } = this.props
    const document = state.document

    if (state.api.isLoading || document.isLoading) {
      return (
        <SpinningWheel />
      )
    }

    if (document.remoteError) {
      let listRoute = onBuildBaseUrl({
        documentId: null
      })

      return (
        <ErrorMessage
          data={{href: listRoute}}
          type={Constants.ERROR_DOCUMENT_NOT_FOUND}
        />
      )
    }

    if (!document.local || typeof onRender !== 'function') {
      return null
    }

    let documentData = Object.assign({}, document.remote, document.local)

    return onRender(documentData, document.localMeta)
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    document: state.document,
    documents: state.documents,
    user: state.user,
    router: state.router
  }),
  dispatch => bindActionCreators({
    ...appActions,
    ...documentActions,
    ...documentsActions,
    ...routerActions
  }, dispatch)
)(DocumentEdit)
