'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {route} from 'preact-router'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './DocumentEdit.css'

import * as Constants from 'lib/constants'
import * as appActions from 'actions/appActions'
import * as documentActions from 'actions/documentActions'
import * as fieldComponents from 'lib/field-components'

import APIBridge from 'lib/api-bridge-client'
import {batchActions} from 'lib/redux'
import {buildUrl, createRoute} from 'lib/router'
import {connectHelper, filterHiddenFields, slugify, Case} from 'lib/util'
import {getCurrentApi, getCurrentCollection} from 'lib/app-config'

import DocumentEditToolbar from 'components/DocumentEditToolbar/DocumentEditToolbar'
import FieldImage from 'components/FieldImage/FieldImage'
import FieldBoolean from 'components/FieldBoolean/FieldBoolean'
import FieldReference from 'components/FieldReference/FieldReference'
import FieldString from 'components/FieldString/FieldString'
import SubNavItem from 'components/SubNavItem/SubNavItem'

const actions = {...appActions, ...documentActions}

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
     * The name of the collection currently being listed.
     */
    collection: proptypes.string,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * The name of the group where the current collection belongs (if any).
     */
    group: proptypes.string,

    /**
    * A callback to be fired if the container wants to attempt changing the
    * page title.
    */
    onPageTitle: proptypes.func,

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

    this.state.saveAttempt = null
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      collection,
      documentId,
      group,
      onPageTitle,
      referencedField,
      section,
      state
    } = this.props

    const currentCollection = getCurrentCollection(state.api.apis, group, collection, referencedField)
    const method = documentId ? 'edit' : 'new'

    if (typeof onPageTitle === 'function') {
      onPageTitle(`${Case.sentence(method)} document`)  
    }

    if (currentCollection) {
      const collectionFields = filterHiddenFields(currentCollection.fields, 'editor')
      const fields = this.groupFields(collectionFields)

      if (section) {
        const sectionMatch = fields.sections.find(fieldSection => fieldSection.slug === section)

        if (!sectionMatch) {
          const firstSection = fields.sections[0]

          route(buildUrl(group, currentCollection.name, 'document', method, documentId, firstSection.slug))

          return false
        }
      }
    }

    this.currentApi = getCurrentApi(state.api.apis, group, collection)
    this.currentCollection = currentCollection
  }

  componentDidUpdate(previousProps, previousState) {
    const {
      dispatch,
      documentId,
      group,
      state
    } = this.props
    const document = state.document
    const {saveAttempt} = this.state
    const previousDocument = previousProps.state.document

    if (!previousDocument.local && document.local && document.loadedFromLocalStorage) {
      const notification = {
        message: 'This document has unsaved changes',
        options: {
          'Discard': this.handleDiscardUnsavedChanges.bind(this)
        }
      }

      dispatch(actions.setNotification(notification))
    }

    // There's no document ID, so it means we're creating a new document.
    if (!documentId) {
      // If there isn't a document in `document.local`, we start a new one.
      if (!document.local && this.currentCollection) {
        dispatch(actions.startNewDocument())
      }

      return
    }

    // We're editing an existing document. We need to fetch it from the remote
    // API if:
    //
    // - We're not already in the process of fetching one AND
    // - There is no document in the store OR the document id has changed AND
    // - All APIs have collections
    const notLoading = document.remoteStatus !== Constants.STATUS_LOADING
      && document.remoteStatus !== Constants.STATUS_SAVING
    const documentIdHasChanged = document.remote &&
      (documentId !== document.remote._id)
    const needsFetch = !document.remote || documentIdHasChanged
    const allApisHaveCollections = state.api.apis.filter(api => !api.collections).length === 0

    if (notLoading && needsFetch && allApisHaveCollections && this.currentCollection) {
      this.fetchDocument()
    }

    // Are we trying to save the document?
    if (!previousState.saveAttempt && saveAttempt) {
      this.processSave(saveAttempt)
    }

    const wasSaving = previousDocument.remoteStatus === Constants.STATUS_SAVING
    const isIdle = document.remoteStatus === Constants.STATUS_IDLE

    // Have we just saved a document?
    if (wasSaving && isIdle) {
      this.processSaveResult()
    }
  }

  componentWillMount() {
    const {
      collection,
      group,
      referencedField,
      state
    } = this.props

    this.currentCollection = getCurrentCollection(state.api.apis, group, collection, referencedField)
    this.currentApi = getCurrentApi(state.api.apis, group, collection)
    this.userLeavingDocumentHandler = this.handleUserLeavingDocument.bind(this)

    window.addEventListener('beforeunload', this.userLeavingDocumentHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.userLeavingDocumentHandler)
  }

  render() {
    const {
      collection,
      documentId,
      group,
      referencedField,
      section,
      state
    } = this.props
    const document = state.document

    if (document.remoteStatus === Constants.STATUS_LOADING || !this.currentCollection || !document.local) {
      return null
    }

    const collectionFields = filterHiddenFields(this.currentCollection.fields, 'editor')
    const fields = this.groupFields(collectionFields)
    const sections = fields.sections || [{
      slug: 'other',
      fields: fields.other
    }]
    const activeSection = section || sections[0].slug
    const hasValidationErrors = document.validationErrors
      && Object.keys(document.validationErrors)
          .filter(field => document.validationErrors[field])
          .length
    const hasConnectionIssues = state.app.networkStatus !== Constants.NETWORK_OK
    const method = documentId ? 'edit' : 'new'

    let documentData = Object.assign({}, document.remote, document.local)

    // (!) This will be used once we add the ability to edit nested documents.
    //if (referencedField) {
    //  documentData = documentData[referencedField]
    //}

    return (
      <div class={styles.container}>
        {fields.sections &&
          <div class={styles.navigation}>
            {fields.sections.map(collectionSection => {
              let isActive = activeSection === collectionSection.slug
              let href = buildUrl(group, collection, 'document', method, documentId, collectionSection.slug)

              return (
                <SubNavItem
                  active={isActive}
                  error={collectionSection.hasErrors}
                  href={href}
                >
                  {collectionSection.name}
                </SubNavItem>
              )
            })}
          </div>
        }

        {sections.map(section => {
          let sectionClass = new Style(styles, 'section')

          sectionClass.addIf('section-active', section.slug === activeSection)

          const fields = {
            main: section.fields.filter(field => !field.publish || field.publish.placement === 'main'),
            sidebar: section.fields.filter(field => field.publish && field.publish.placement === 'sidebar')
          }

          const mainBodyStyle = new Style(styles, 'main')

          // If there are no fields in the side bar, the main body can use
          // the full width of the page.
          mainBodyStyle.addIf('main-full', !fields.sidebar.length)

          return (
            <section class={sectionClass.getClasses()}>
              <div class={mainBodyStyle.getClasses()}>
                {fields.main.map(field => this.renderField(field, documentData[field._id]))}
              </div>

              {(fields.sidebar.length > 0) &&
                <div class={styles.sidebar}>
                  {fields.sidebar.map(field => this.renderField(field, documentData[field._id]))}
                </div>
              }
            </section>
          )
        })}

        <DocumentEditToolbar
          document={documentData}
          hasConnectionIssues={hasConnectionIssues}
          hasValidationErrors={hasValidationErrors}
          method={method}
          onSave={this.handleSave.bind(this)}
          peers={document.peers}
        />
      </div>
    )
  }

  // Boolean fields are a bit special. Any required field that hasn't
  // been touched by the user in the UI should generate a validation error,
  // except for Boolean fields, as these don't have a "neutral" state.
  // You can start editing a document and see a Boolean field set to
  // "false" and that may be exactly how you want it, but at that point the
  // field doesn't exist in the document store yet because there wasn't a
  // change event. To get around this, we check for any required Boolean
  // fields in the collection that aren't in the document object and
  // set those to `false`.
  addRequiredBooleanFieldsToDocument(document) {
    const collectionSchema = this.currentCollection
    const booleanFields = Object.keys(collectionSchema.fields).filter(fieldName => {
      const field = collectionSchema.fields[fieldName]

      return field.required && field.type === 'Boolean'
    })

    let newDocument = Object.assign({}, document)

    booleanFields.forEach(booleanField => {
      if (typeof newDocument[booleanField] === 'undefined') {
        newDocument[booleanField] = false
      }
    })

    return newDocument
  }

  // Fetches a document from the remote API
  fetchDocument() {
    const {
      collection,
      dispatch,
      documentId,
      group,
      state
    } = this.props

    // As far as the fetch method is concerned, we're only interested in the
    // collection of the main document, not the referenced one.
    const documentCollection = getCurrentCollection(state.api.apis, group, collection)
    const collectionFields = Object.keys(filterHiddenFields(documentCollection.fields, 'editor'))
      .concat(['createdAt', 'createdBy', 'lastModifiedAt', 'lastModifiedBy'])

    const query = {
      api: this.currentApi,
      collection: documentCollection.name,
      id: documentId,
      fields: collectionFields
    }

    dispatch(actions.fetchDocument(query))
  }

  // Groups fields by section
  groupFields(fields) {
    const {state} = this.props
    const document = state.document

    let sections = {}
    let sectionsArray = null
    let other = []

    Object.keys(fields).forEach(fieldSlug => {
      const field = Object.assign({}, fields[fieldSlug], {
        _id: fieldSlug
      })
      const section = field.publish && field.publish.section

      if (section) {
        sections[section] = sections[section] || []
        sections[section].push(field)
      } else {
        other.push(field)
      }
    })

    // Converting sections to an array including slug
    if (Object.keys(sections).length) {
      sectionsArray = Object.keys(sections).map(sectionName => {
        const fields = sections[sectionName]
        const sectionHasErrors = document.validationErrors
          && fields.some(field => document.validationErrors[field._id])

        let section = {
          fields,
          hasErrors: sectionHasErrors,
          name: sectionName,
          slug: slugify(sectionName)
        }

        return section
      })
    }

    return {
      sections: sectionsArray,
      other
    }
  }

  handleDiscardUnsavedChanges() {
    const {dispatch} = this.props

    dispatch(actions.discardUnsavedChanges())
  }

  // Handles the callback that fires whenever a field changes and the new value
  // is ready to be sent to the store.
  handleFieldChange(fieldName, value) {
    const {
      collection,
      dispatch,
      documentId,
      group
    } = this.props

    dispatch(actions.updateLocalDocument({
      [fieldName]: value
    }))
  }

  // Handles the callback that fires whenever there's a new validation error
  // in a field or when a validation error has been cleared.
  handleFieldError(fieldName, hasError, value) {
    const {dispatch} = this.props

    dispatch(actions.setFieldErrorStatus(fieldName, value, hasError))
  }

  // Handles a click on the save button
  handleSave(saveMode) {
    const {saveAttempt} = this.state

    // If we've tried to save before, then the initial validation step
    // has been done, so we can process the save straight away.
    if (saveAttempt) {
      this.processSave(saveMode)
    } else {
      // Otherwise, we set the `saveAttempt` state, which will force
      // fields to validate. The save will be processed on the next update
      // call.
      this.setState({
        saveAttempt: saveMode
      })
    }
  }

  handleUserLeavingDocument() {
    const {
      dispatch,
      documentId,
      group
    } = this.props

    dispatch(actions.registerUserLeavingDocument({
      collection: this.currentCollection,
      documentId,
      group
    }))
  }

  // Processes the save of the document
  processSave(saveMode) {
    const {
      collection,
      documentId,
      group,
      section,
      state
    } = this.props
    const document = state.document
    const {validationErrors} = document
    const hasValidationErrors = validationErrors && Object.keys(validationErrors)
      .filter(field => validationErrors[field])
      .length

    // If there are any validation errors, we abort the save operation.
    if (hasValidationErrors) return

    this.saveDocument(saveMode !== 'saveAsDuplicate' ? documentId : null)
  }

  processSaveResult() {
    const {
      collection,
      dispatch,
      group,
      section,
      state
    } = this.props
    const newDocument = !Boolean(this.props.documentId)
    const documentId = state.document.remote._id
    const saveMode = this.state.saveAttempt

    switch (saveMode) {
      // Save
      case 'save':
        route(buildUrl(group, collection, 'document', 'edit', documentId, section))

        dispatch(actions.setNotification({
          message:`The document has been ${newDocument ? 'created' : 'updated'}`
        }))

        break

      // Save and create new
      case 'saveAndCreateNew':
        route(buildUrl(group, collection, 'document', 'new'))

        dispatch(
          batchActions(
            actions.setNotification({
              message: `The document has been ${newDocument ? 'created' : 'updated'}`
            }),
            actions.clearRemoteDocument()
          )
        )

        break

      // Save and go back
      case 'saveAndGoBack':
        route(buildUrl(group, collection, 'documents'))

        dispatch(actions.setNotification({
          message: `The document has been ${newDocument ? 'created' : 'updated'}`
        }))

        break

      // Save as duplicate
      case 'saveAsDuplicate':
        route(buildUrl(group, collection, 'document', 'edit', newDocumentId, section))

        dispatch(actions.setNotification({
          message: `The document has been created`
        }))

        break
    }
  }

  // Renders a field, deciding which component to use based on the field type
  renderField(field, value) {
    const {
      collection,
      documentId,
      group,
      state
    } = this.props
    const {app, document} = state
    const hasError = document.validationErrors
      && document.validationErrors[field._id]
    const {saveAttempt} = this.state

    // As per API docs, validation messages are in the format "must be xxx", which
    // assumes that something (probably the name of the field) will be prepended to
    // the string to form a final error message. For this reason, we're prepending
    // the validation message with "This field", but this is something that we can
    // easily revisit.
    const error = typeof hasError === 'string' ? 'This field ' + hasError : hasError
    const fieldType = field.publish && field.publish.subType ? field.publish.subType : field.type
    const fieldComponentName = `Field${fieldType}`
    const FieldComponent = fieldComponents[fieldComponentName]

    if (!FieldComponent) {
      console.warn('Unknown field type:', fieldType)

      return null
    }

    return (
      <div class={styles.field}>
        <FieldComponent
          collection={collection}
          config={app.config[fieldComponentName]}
          currentApi={this.currentApi}
          currentCollection={this.currentCollection}
          documentId={documentId}
          error={error}
          forceValidation={saveAttempt}
          group={group}
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
          schema={field}
          value={value}
        />
      </div>
    )
  }

  saveDocument(documentId) {
    const {
      collection,
      dispatch,
      group,
      section,
      state
    } = this.props
    let document = state.document.local

    // If we're creating a new document, we need to inject any required Boolean
    // fields.
    if (!documentId) {
      document = Object.assign({}, state.document.remote, state.document.local)
      document = this.addRequiredBooleanFieldsToDocument(document)
    }

    dispatch(actions.saveDocument({
      api: this.currentApi,
      collection: this.currentCollection,
      document,
      documentId
    }))
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    document: state.document
  })
)(DocumentEdit)
