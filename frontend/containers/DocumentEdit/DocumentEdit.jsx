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

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {connectHelper, slugify, Case} from 'lib/util'
import {getCurrentApi, getCurrentCollection} from 'lib/app-config'

import DocumentEditToolbar from 'components/DocumentEditToolbar/DocumentEditToolbar'
import FieldAsset from 'components/FieldAsset/FieldAsset'
import FieldBoolean from 'components/FieldBoolean/FieldBoolean'
import FieldString from 'components/FieldString/FieldString'
import SubNavItem from 'components/SubNavItem/SubNavItem'

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

    this.state.hasTriedSubmitting = false
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      actions,
      collection,
      documentId,
      group,
      onPageTitle,
      section,
      state
    } = this.props

    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const method = documentId ? 'edit' : 'new'

    if (typeof onPageTitle === 'function') {
      onPageTitle(`${Case.sentence(method)} document`)  
    }

    if (currentCollection) {
      const collectionFields = this.filterHiddenFields(currentCollection.fields)
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

    this.currentCollection = currentCollection
  }

  componentDidUpdate(previousProps, previousState) {
    const {
      actions,
      documentId,
      group,
      state
    } = this.props
    const document = state.document
    const documentIdHasChanged = documentId !== previousProps.documentId
    const {hasTriedSubmitting} = this.state
    const previousDocument = previousProps.state.document

    // There's no document ID, so it means we're creating a new document.
    if (!documentId) {
      // If there isn't a document in `document.local`, we start a new one.
      if (!document.local) {
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
    const notLoading = document.remoteStatus !== Constants.STATUS_LOADING
    const needsFetch = !document.remote || documentIdHasChanged
    const allApisHaveCollections = state.api.apis.filter(api => !api.collections).length === 0

    if (notLoading && needsFetch && allApisHaveCollections) {
      this.fetchDocument(documentId)
    }

    // If `validationErrors` was previously `null` but now has a value (even
    // if an empty object), it means that we have just started validating the
    // document. If `hasTriedSubmitting` is also true, it means we are trying
    // to save the document, so we call  `processSave()`.
    const hasBeenValidated = !previousDocument.validationErrors && document.validationErrors

    if (hasBeenValidated && hasTriedSubmitting) {
      this.processSave(hasTriedSubmitting)
    }

    if (!previousDocument.local && document.local && document.loadedFromLocalStorage) {
      const context = {
        collection: this.currentCollection,
        documentId,
        group
      }
      const notification = {
        message: 'This document has unsaved changes',
        options: {
          'Discard': this.handleDiscardUnsavedChanges.bind(this, context)
        }
      }

      actions.setNotification(notification)
    }
  }

  componentWillMount() {
    const {collection, group, state} = this.props

    this.currentCollection = getCurrentCollection(state.api.apis, group, collection)
  }

  componentWillUnmount() {
    const {actions} = this.props

    actions.clearRemoteDocument()
  }

  render() {
    const {
      actions,
      collection,
      documentId,
      group,
      section,
      state
    } = this.props

    const document = state.document

    if (document.remoteStatus === Constants.STATUS_LOADING || !this.currentCollection || !document.local) {
      return null
    }

    const collectionFields = this.filterHiddenFields(this.currentCollection.fields)
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
                {fields.main.map(field => this.renderField(field))}
              </div>

              {(fields.sidebar.length > 0) &&
                <div class={styles.sidebar}>
                  {fields.sidebar.map(field => this.renderField(field))}
                </div>
              }
            </section>
          )
        })}

        <DocumentEditToolbar
          document={document.local}
          hasConnectionIssues={hasConnectionIssues}
          hasValidationErrors={hasValidationErrors}
          method={method}
          onSave={this.handleSave.bind(this)}
          peers={document.peers}
        />
      </div>
    )
  }

  // Fetches a document from the remote API
  fetchDocument(documentId) {
    const {
      actions,
      collection,
      group,
      state
    } = this.props
    const currentApi = getCurrentApi(state.api.apis, group, collection)
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const collectionFields = Object.keys(this.filterHiddenFields(currentCollection.fields))
      .map(key => key)

    collectionFields.push('createdAt', 'createdBy', 'lastModifiedAt', 'lastModifiedBy')

    actions.setRemoteDocumentStatus(Constants.STATUS_LOADING)

    return APIBridge(currentApi)
      .in(currentCollection.name)
      .whereFieldIsEqualTo('_id', documentId)
      .useFields(collectionFields)
      .find()
      .then(response => {
        if (!response.results.length) return

        const document = response.results[0]
      
        actions.setRemoteDocument(document, {
          collection: currentCollection,
          documentId,
          group
        })
      })
  }

  filterHiddenFields(fields) {
    return Object.assign({}, ...Object.keys(fields)
      .filter(key => {
        // If the publish && display block don't exist, or if list is true allow this field to pass.
        return !fields[key].publish 
          || !fields[key].publish.display 
          || fields[key].publish.display.editor
      }).map(key => {
        return {[key]: fields[key]}
      })
    )
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

  handleDiscardUnsavedChanges(context) {
    const {actions} = this.props

    actions.discardUnsavedChanges(context)
  }

  // Handles the callback that fires whenever a field changes and the new value is ready
  // to be sent to the store
  handleFieldChange(fieldName, value) {
    const {
      actions,
      collection,
      documentId,
      group
    } = this.props

    actions.updateLocalDocument({
      [fieldName]: value
    }, {
      collection,
      documentId,
      group
    })
  }

  // Handles the callback that fires whenever there's a new validation error in a field or
  // when a validation error has been cleared
  handleFieldError(fieldName, hasError, value) {
    const {actions} = this.props

    actions.setFieldErrorStatus(fieldName, value, hasError)
  }

  // Handles a click on the save button
  handleSave(saveMode) {
    const {hasTriedSubmitting} = this.state

    // If we've tried to submit before, then the initial validation step
    // has been done, so we can process the save straight away.
    if (hasTriedSubmitting) {
      this.processSave(saveMode)
    } else {
      // Otherwise, we set the `hasTriedSubmitting` state, which will force
      // fields to validate. The save will be processed on the next update
      // call.
      this.setState({
        hasTriedSubmitting: saveMode
      })
    }
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

    let notification = {
      dismissAfterSeconds: 10,
      type: Constants.NOTIFICATION_TYPE_SUCCESS
    }

    switch (saveMode) {
      // Save
      case 'save':
        notification.message = `The document has been ${documentId ? 'updated' : 'created'}`

        return this.saveDocument(documentId, notification).then(newDocumentId => {
          // If we're creating a new document (either by starting a blank one or by
          // duplicating an existing one), we redirect to the new document ID.
          if (documentId !== newDocumentId) {
            route(buildUrl(group, collection, 'document', 'edit', newDocumentId, section))
          }
        })

      // Save and create new
      case 'saveAndCreateNew':
        notification.message = `The document has been ${documentId ? 'updated' : 'created'}`

        return this.saveDocument(documentId).then(newDocumentId => {
          route(buildUrl(group, collection, 'document', 'new'))
        })

      // Save and go back
      case 'saveAndGoBack':
        notification.message = `The document has been ${documentId ? 'updated' : 'created'}`

        return this.saveDocument(documentId).then(newDocumentId => {
          route(buildUrl(group, collection, 'documents'))
        })

      // Save as duplicate
      case 'saveAsDuplicate':
        notification.message = `The document has been created`

        return this.saveDocument().then(newDocumentId => {
          route(buildUrl(group, collection, 'document', 'edit', newDocumentId, section))
        })
    }
  }

  // Renders a field, deciding which component to use based on the field type
  renderField(field) {
    const {app, document} = this.props.state
    const hasError = document.validationErrors
      && document.validationErrors[field._id]
    const {hasTriedSubmitting} = this.state

    // As per API docs, validation messages are in the format "must be xxx", which
    // assumes that something (probably the name of the field) will be prepended to
    // the string to form a final error message. For this reason, we're prepending
    // the validation message with "This field", but this is something that we can
    // easily revisit.
    const error = typeof hasError === 'string' ? 'This field ' + hasError : hasError
    const fieldType = field.publish && field.publish.subType ? field.publish.subType : field.type

    let fieldElement = null

    switch (fieldType) {
      case 'Boolean':
        fieldElement = (
          <FieldBoolean
            error={error}
            forceValidation={hasTriedSubmitting}
            onChange={this.handleFieldChange.bind(this)}
            onError={this.handleFieldError.bind(this)}
            value={document.local[field._id]}
            schema={field}
          />
        )

        break

      case 'String':
        fieldElement = (
          <FieldString
            error={error}
            forceValidation={hasTriedSubmitting}
            onChange={this.handleFieldChange.bind(this)}
            onError={this.handleFieldError.bind(this)}
            value={document.local[field._id]}
            schema={field}
          />
        )

        break

        case 'Image':
          fieldElement = (
            <FieldAsset
              error={error}
              config={app.config.FieldAsset}
              showPreview={true}
              onChange={this.handleFieldChange.bind(this)}
              onError={this.handleFieldError.bind(this)}
              value={document.local[field._id]}
              schema={field}
            />
          )

          break
    }

    return fieldElement ? <div class={styles.field}>{fieldElement}</div> : null
  }

  saveDocument(documentId, successNotification) {
    const {
      actions,
      collection,
      group,
      section,
      state
    } = this.props
    const currentApi = getCurrentApi(state.api.apis, group, collection)
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const collectionFields = this.filterHiddenFields(currentCollection.fields)
    const document = state.document.local

    let apiBridge = APIBridge(currentApi).in(currentCollection.name)

    // Cycle through referenced documents
    Object.keys(document).forEach(docField => {
      let fieldMatch = Object.keys(collectionFields).find(field => docField === field)

      if (fieldMatch && collectionFields[fieldMatch].type === 'Reference') {
        if (Object.is(typeof document[fieldMatch]._id, String)) {
          // Existing referenced document
        } else {
          // New Reference document

        }
      }
    })

    // If we have a documentId, we're updating an existing document.
    if (documentId) {
      apiBridge = apiBridge.whereFieldIsEqualTo('_id', documentId).update(document)
    } else {
      // If not, we're creating a new document.
      apiBridge = apiBridge.create(document)
    }

    return apiBridge.then(response => {
      if (response.results && response.results.length) {
        actions.saveDocument({
          collection: currentCollection,
          documentId,
          group
        }, successNotification)

        return response.results[0]._id
      }

      throw 'SAVE_ERROR'
    }).catch(response => {
      if (response.errors && response.errors.length) {
        // We should be able to do the same validation as API, which means that
        // in theory we should never get to the point where we allow the form
        // to be submitted and still get validation errors from API. However,
        // if that happens, we treat the errors from the response in the same
        // way we treat the local ones, adding them to the document store.
        actions.setErrorsFromRemoteApi(response.errors)
      } else {
        throw 'SAVE_ERROR'
      }
    })
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    document: state.document
  }),
  dispatch => bindActionCreators({...appActions, ...documentActions}, dispatch)
)(DocumentEdit)
