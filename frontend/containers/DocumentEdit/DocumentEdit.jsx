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
import * as documentsActions from 'actions/documentsActions'
import * as routerActions from 'actions/routerActions'
import * as fieldComponents from 'lib/field-components'

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {connectHelper, filterHiddenFields, slugify, Case} from 'lib/util'
import {getApiForUrlParams, getCollectionForUrlParams} from 'lib/collection-lookup'

import Button from 'components/Button/Button'
import ErrorMessage from 'components/ErrorMessage/ErrorMessage'
import FieldImage from 'components/FieldImage/FieldImage'
import FieldBoolean from 'components/FieldBoolean/FieldBoolean'
import FieldReference from 'components/FieldReference/FieldReference'
import FieldString from 'components/FieldString/FieldString'
import HeroMessage from 'components/HeroMessage/HeroMessage'
import SubNavItem from 'components/SubNavItem/SubNavItem'

/**
 * The interface for editing a document.
 */
class DocumentEdit extends Component {
  static propTypes = {
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
      group,
      onBuildBaseUrl,
      onPageTitle,
      referencedField,
      section,
      state
    } = this.props
    const currentApi = getApiForUrlParams(state.api.apis, {
      collection,
      group
    })
    const currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      referencedField,
      useApi: currentApi
    })
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
          const sectionUrlBase = onBuildBaseUrl()

          route(buildUrl(...sectionUrlBase, documentId, firstSection.slug))

          return false
        }
      }
    }

    this.currentApi = currentApi
    this.currentCollection = currentCollection
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
      collection,
      documentId,
      group,
      state,
      actions
    } = this.props
    const document = state.document
    const previousDocument = previousProps.state.document
    const status = document.remoteStatus

    // Are there unsaved changes?
    if (!previousDocument.local && document.local && document.loadedFromLocalStorage) {
      const notification = {
        message: 'You have unsaved changes',
        options: {
          'Discard': actions.discardUnsavedChanges()
        }
      }

      actions.setNotification(notification)
    }

    // If there's an error, stop here.
    if (this.hasFetched && (status === Constants.STATUS_NOT_FOUND)) {
      return
    }

    // There's no document ID, so it means we're creating a new document.
    if (!documentId) {
      // If there isn't a document in `document.local`, we start a new one.
      if (!document.local && this.currentCollection) {
        actions.startNewDocument()
      }

      return
    }

    // We're editing an existing document. We need to fetch it from the remote
    // API if:
    //
    // - We're not already in the process of fetching one AND
    // - There is no document in the store OR the document id has changed AND
    // - All APIs have collections
    const isIdle = document.remoteStatus === Constants.STATUS_IDLE
    const remoteDocumentHasChanged = document.remote &&
      (documentId !== document.remote._id)
    const needsFetch = !document.remote || remoteDocumentHasChanged

    if (isIdle && needsFetch && this.currentCollection) {
      this.handleRoomChange()
      this.fetchDocument()
    }
  }

  componentWillMount() {
    const {
      collection,
      group,
      referencedField,
      state
    } = this.props
    const currentApi = getApiForUrlParams(state.api.apis, {
      collection,
      group
    })
    const currentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group,
      referencedField,
      useApi: currentApi
    })

    this.currentApi = currentApi
    this.currentCollection = currentCollection
    this.userLeavingDocumentHandler = this.handleUserLeavingDocument.bind(this)

    window.addEventListener('beforeunload', this.userLeavingDocumentHandler)
  }

  componentWillUnmount() {
    const {actions} = this.props
    window.removeEventListener('beforeunload', this.userLeavingDocumentHandler)
    actions.roomChange(null)
  }

  render() {
    const {
      collection,
      documentId,
      group,
      onBuildBaseUrl,
      referencedField,
      section,
      state
    } = this.props
    const document = state.document
    const status = document.remoteStatus

    if (status === Constants.STATUS_NOT_FOUND) {
      return (
        <ErrorMessage
          data={{href: buildUrl(group, collection, 'documents')}}
          type={Constants.ERROR_DOCUMENT_NOT_FOUND}
        />
      )
    }

    if (status === Constants.STATUS_IDLE && !this.currentCollection && this.hasFetched) {
      return (
        <ErrorMessage type={Constants.ERROR_ROUTE_NOT_FOUND} />
      )
    }

    if (status === Constants.STATUS_LOADING || !document.local) {
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
              const isActive = activeSection === collectionSection.slug
              const sectionUrlBase = onBuildBaseUrl()
              const href = buildUrl(...sectionUrlBase, collectionSection.slug)

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
      </div>
    )
  }

  // Fetches a document from the remote API
  fetchDocument() {
    const {
      collection,
      documentId,
      group,
      state,
      actions
    } = this.props

    // As far as the fetch method is concerned, we're only interested in the
    // collection of the main document, not the referenced one.
    const documentCollection = getCollectionForUrlParams(state.api.apis, {
      collection,
      group
    })
    const collectionFields = Object.keys(filterHiddenFields(documentCollection.fields, 'editor'))
      .concat(['createdAt', 'createdBy', 'lastModifiedAt', 'lastModifiedBy'])

    const query = {
      api: this.currentApi,
      collection: documentCollection,
      id: documentId,
      fields: collectionFields
    }

    actions.fetchDocument(query)

    this.hasFetched = true
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

  // Handles the callback that fires whenever a field changes and the new value
  // is ready to be sent to the store.
  handleFieldChange(fieldName, value, persistInLocalStorage = true) {
    const {
      actions,
      collection,
      documentId,
      group
    } = this.props

    actions.updateLocalDocument({
      [fieldName]: value
    }, {
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
      documentId,
      group
    } = this.props

    actions.registerUserLeavingDocument({
      collection: this.currentCollection,
      documentId,
      group
    })
  }

  // Renders a field, deciding which component to use based on the field type
  renderField(field, value) {
    const {
      collection,
      documentId,
      group,
      onBuildBaseUrl,
      state
    } = this.props
    const {app, document} = state
    const hasAttemptedSaving = Boolean(document.saveAttempts)
    const hasError = document.validationErrors
      && document.validationErrors[field._id]

    // As per API docs, validation messages are in the format "must be xxx", which
    // assumes that something (probably the name of the field) will be prepended to
    // the string to form a final error message. For this reason, we're prepending
    // the validation message with "This field", but this is something that we can
    // easily revisit.
    const error = typeof hasError === 'string' ? 'This field ' + hasError : hasError
    const fieldType = field.publish && field.publish.subType ? field.publish.subType : field.type
    const fieldComponentName = `Field${fieldType}`
    const FieldComponent = fieldComponents[fieldComponentName] && fieldComponents[fieldComponentName].edit

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
          forceValidation={hasAttemptedSaving}
          group={group}
          onBuildBaseUrl={onBuildBaseUrl}
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
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
