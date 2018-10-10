'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {route} from '@dadi/preact-router'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './DocumentEdit.css'

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

  shouldComponentUpdate(nextProps, nextState) {
    const {
      collection,
      documentId,
      onPageTitle,
      section,
      state
    } = this.props
    const method = documentId ? 'edit' : 'new'

    if (typeof onPageTitle === 'function') {
      onPageTitle(`${Format.sentenceCase(method)} document`)  
    }

    if (collection) {
      const collectionFields = filterVisibleFields({
        fields: collection.fields,
        view: 'edit'
      })
      const fields = this.groupFields(collectionFields)

      if (section) {
        const sectionMatch = fields.sections.find(fieldSection => {
          return fieldSection.slug === section
        })

        if (!sectionMatch) {
          const firstSection = fields.sections[0]

          // Redirect to first section.
          route(
            this.buildHref(method, firstSection)
          )

          return false
        }
      }
    }
  }

  handleRoomChange() {
    const {state, actions, documentId} = this.props

    if (documentId && state.router.room !== documentId) {
      actions.roomChange(documentId)
    }
  }

  componentWillUpdate(nextProps, nextState) {
    this.handleRoomChange()
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
      this.handleRoomChange()
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
      actions
    } = this.props

    window.removeEventListener('beforeunload', this.userLeavingDocumentHandler)
    actions.roomChange(null)
  }

  render() {
    const {
      collection,
      documentId,
      onBuildBaseUrl,
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

    if (!document.local) {
      return null
    }

    const collectionFields = filterVisibleFields({
      fields: collection.fields,
      view: 'edit'
    })
    const fields = this.groupFields(collectionFields)
    const sections = fields.sections || [{
      slug: 'other',
      fields: fields.other
    }]
    const activeSection = section || sections[0].slug
    const hasValidationErrors = document.validationErrors
    const method = documentId ? 'edit' : 'new'

    // Add a link to each section before passing it down.
    sections.forEach(section => {
      section.href = this.buildHref(method, section)
    })

    return (
      <TabbedFieldSections
        activeSection={activeSection}
        renderField={this.renderField.bind(this)}
        sections={sections}
      />
    )
  }

  buildHref(method, section) {
    const {
      collection,
      documentId,
      onBuildBaseUrl,
      state
    } = this.props

    return onBuildBaseUrl({
      createNew: !Boolean(documentId),
      search: state.router.search,
      section: section && section.slug,
    })
  }

  // Fetches a document from the remote API
  fetchDocument() {
    const {
      actions,
      collection,
      collectionParent,
      documentId,
      state
    } = this.props

    // As far as the fetch method is concerned, we're only interested in the
    // collection of the main document, not the referenced one.
    let parentCollection = collectionParent || collection
    let collectionFields = visibleFieldList({
      fields: parentCollection.fields,
      view: 'edit'
    })
    let query = {
      api: state.api.currentApi,
      collection: parentCollection,
      id: documentId,
      fields: collectionFields
    }

    actions.fetchDocument(query)

    this.hasFetched = true
  }

  // Groups fields by section based on the `section` property of the `publish`
  // block present in their schema. It returns an object with two properties:
  //
  // - `sections`: an array of sections, each containing:
  //    - `fields`: array containing the schema of the fields in the section
  //    - `hasErrors`: Boolean indicating whether there are fields with errors
  //                   in the section
  //    - `name`: name of the section
  //    - `slug`: slug of the section
  // - `other`: array containing the schemas of fields without a section
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
          slug: Format.slugify(sectionName)
        }

        return section
      })
    }

    return {
      sections: sectionsArray,
      other
    }
  }

  // Handles the callback that fires whenever a field changes and the new value
  // is ready to be sent to the store.
  handleFieldChange(fieldName, value, persistInLocalStorage = true) {
    const {
      actions,
      collection,
      group
    } = this.props

    actions.updateLocalDocument({
      [fieldName]: value
    }, {
      collection,
      group,
      persistInLocalStorage
    })
  }

  // Handles the callback that fires whenever there's a new validation error
  // in a field or when a validation error has been cleared.
  handleFieldError(fieldName, hasError, value) {
    const {actions} = this.props

    actions.setFieldErrorStatus(fieldName, value, hasError)
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

  // Renders a field, deciding which component to use based on the field type
  renderField(field) {
    const {
      collection,
      documentId,
      group,
      onBuildBaseUrl,
      state
    } = this.props
    const {api, app, document} = state
    const hasAttemptedSaving = document.saveAttempts > 0
    const hasError = document.validationErrors
      && document.validationErrors[field._id]
    const documentData = Object.assign({}, document.remote, document.local)
    const defaultApiLanguage = api.currentApi.languages &&
      api.currentApi.languages.find(language => language.default)
    const currentLanguage = state.router.search.lang
    const isTranslatable = field.type.toLowerCase() === 'string'
    const isTranslation = currentLanguage &&
      currentLanguage !== defaultApiLanguage.code

    // This needs to adapt to the i18n.fieldCharacter configuration property of
    // the API, but currently Publish doesn't have a way of knowing this. For now,
    // we hardcode the default character, and in a future release of API we need to
    // expose this information in the /api/languages endpoint.
    let languageFieldCharacter = ':'
    let displayName = field.label || field._id
    let fieldName = field._id
    let placeholder = field.placeholder

    if (isTranslation && isTranslatable) {
      let language = api.currentApi.languages.find(language => {
        return language.code === currentLanguage
      })

      if (language) {
        displayName += ` (${language.name})`
      }

      fieldName += languageFieldCharacter + currentLanguage
      placeholder = documentData[field._id] || placeholder
    }

    let value = documentData[fieldName]

    // As per API docs, validation messages are in the format "must be xxx", which
    // assumes that something (probably the name of the field) will be prepended to
    // the string to form a final error message. For this reason, we're prepending
    // the validation message with "This field", but this is something that we can
    // easily revisit.
    const error = typeof hasError === 'string' ?
      'This field ' + hasError :
      hasError
    const fieldType = field.publish &&
      field.publish.subType ?
        field.publish.subType :
        field.type
    const fieldComponentName = `Field${fieldType}`
    const FieldComponent = fieldComponents[fieldComponentName] &&
      fieldComponents[fieldComponentName].edit
    const fieldComment = field.comment || field.example

    if (!FieldComponent) {
      console.warn('Unknown field type:', fieldType)

      return null
    }

    let fieldStyles = new Style(styles, 'field')

    fieldStyles.addIf('field-disabled', isTranslation && !isTranslatable)

    return (
      <div class={fieldStyles.getClasses()}>
        <FieldComponent
          collection={collection.slug}
          comment={fieldComment}
          config={app.config}
          currentApi={api.currentApi}
          currentCollection={collection}
          displayName={displayName}
          documentId={documentId}
          error={error}
          forceValidation={hasAttemptedSaving}
          group={group}
          name={fieldName}
          onBuildBaseUrl={onBuildBaseUrl}
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
          placeholder={placeholder}
          required={field.required && !isTranslation}
          schema={field}
          value={value}
        />
      </div>
    )
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
