'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {connect} from 'preact-redux'
import {route} from 'preact-router'
import {bindActionCreators} from 'redux'

import Style from 'lib/Style'
import styles from './DocumentEdit.css'

import * as Constants from 'lib/constants'
import * as documentActions from 'actions/documentActions'

import APIBridge from 'lib/api-bridge-client'
import {buildUrl, createRoute} from 'lib/router'
import {connectHelper, slugify} from 'lib/util'
import {getCurrentApi, getCurrentCollection} from 'lib/app-config'

import Button from 'components/Button/Button'
import ButtonWithOptions from 'components/ButtonWithOptions/ButtonWithOptions'
import FieldBoolean from 'components/FieldBoolean/FieldBoolean'
import FieldImage from 'components/FieldImage/FieldImage'
import FieldString from 'components/FieldString/FieldString'
import SubNavItem from 'components/SubNavItem/SubNavItem'
import Toolbar from 'components/Toolbar/Toolbar'

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
      section,
      state
    } = this.props

    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const method = documentId ? 'edit' : 'new'

    if (currentCollection) {
      const fields = this.groupFields(currentCollection.fields)

      if (section) {
        const sectionMatch = fields.sections.find(fieldSection => {
          return fieldSection.slug === section
        })

        if (!sectionMatch) {
          const firstSection = fields.sections[0]

          route(buildUrl(group, currentCollection.name, 'document', method, documentId, firstSection.slug))

          return false
        }
      }
    }
  }

  componentDidUpdate(previousProps) {
    const {actions, documentId, state} = this.props
    const document = state.document
    const documentIdHasChanged = documentId !== previousProps.documentId

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
  }

  componentWillUnmount() {
    const {actions} = this.props

    actions.clearRemoteDocument()
  }

  render() {
    const {
      collection,
      documentId,
      group,
      state
    } = this.props

    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const document = state.document

    if (document.remoteStatus === Constants.STATUS_LOADING || !currentCollection || !document.local) {
      return null
    }

    const fields = this.groupFields(currentCollection.fields)
    const sections = fields.sections || [{
      slug: 'other',
      fields: fields.other
    }]
    const activeSection = this.props.section || sections[0].slug
    const hasValidationErrors = Object.keys(document.validationErrors).filter(field => {
      return document.validationErrors[field]
    }).length
    const method = documentId ? 'edit' : 'new'

    // By default, we support these two save modes.
    let saveOptions = {
      'Save and create new': this.handleSave.bind(this, 'saveAndCreateNew'),
      'Save and go back': this.handleSave.bind(this, 'saveAndGoBack')
    }

    // If we're editing an existing document, we also allow users to duplicate
    // the document.
    if (method === 'edit') {
      saveOptions['Save as duplicate'] = this.handleSave.bind(this, 'saveAsDuplicate')
    }

    return (
      <div class={styles.container}>
        {fields.sections &&
          <div class={styles.navigation}>
            {fields.sections.map(collectionSection => {
              return (
                <SubNavItem
                  active={activeSection === collectionSection.slug}
                  error={collectionSection.hasErrors}
                  href={buildUrl(group, collection, 'document', method, documentId, collectionSection.slug)}
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

          const mainBodyFields = section.fields.filter(field => {
            const position = field.publish && field.publish.position

            return !position || position === 'main'
          })

          const sideBarFields = section.fields.filter(field => {
            const position = field.publish && field.publish.position

            return position === 'sidebar'
          })

          const mainBodyStyle = new Style(styles, 'main')

          // If there are no fields in the side bar, the main body can use
          // the full width of the page.
          mainBodyStyle.addIf('main-full', !sideBarFields.length)

          return (
            <section class={sectionClass.getClasses()}>
              <div class={mainBodyStyle.getClasses()}>
                {mainBodyFields.map(field => this.renderField(field))}
              </div>

              {(sideBarFields.length > 0) &&
                <div class={styles.sidebar}>
                  {sideBarFields.map(field => this.renderField(field))}
                </div>
              }
            </section>
          )
        })}

        <Toolbar>
          <div>
            <Button
              accent="destruct"
            >Delete</Button>
          </div>

          <div>
            <ButtonWithOptions
              accent="save"
              disabled={hasValidationErrors}
              onClick={this.handleSave.bind(this, 'save')}
              options={saveOptions}
            >
              Save and continue
            </ButtonWithOptions>
          </div>
        </Toolbar>
      </div>
    )
  }

  // Fetches a document from the remote API
  fetchDocument(documentId) {
    const {
      actions,
      collection,
      onPageTitle,
      group,
      state
    } = this.props
    const currentApi = getCurrentApi(state.api.apis, group, collection)
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)

    actions.setRemoteDocumentStatus(Constants.STATUS_LOADING)

    return APIBridge(currentApi)
      .in(currentCollection.name)
      .whereFieldIsEqualTo('_id', documentId)
      .find()
      .then(response => {
        if (!response.results.length) return

        const document = response.results[0]

        actions.setRemoteDocument(document)

        // This is something to revisit. We don't have the concept of a primary field,
        // which we would use for, among other things, set the title of the page when
        // editing a document. For now, and to be consistent with how we're linking to
        // documents in the document list view, we take the contents of the first field.
        const firstField = Object.keys(currentCollection.fields)[0]

        if (typeof onPageTitle === 'function') {
          onPageTitle.call(this, document[firstField])
        }
      })
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
        const sectionHasErrors = fields.some(field => document.validationErrors[field._id])

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

  saveDocument(documentId) {
    const {
      actions,
      collection,
      group,
      section,
      state
    } = this.props
    const currentApi = getCurrentApi(state.api.apis, group, collection)
    const currentCollection = getCurrentCollection(state.api.apis, group, collection)
    const document = state.document.local

    let apiBridge = APIBridge(currentApi).in(currentCollection.name)

    // If we have a documentId, we're updating an existing document.
    if (documentId) {
      apiBridge = apiBridge.whereFieldIsEqualTo('_id', documentId).update(document)
    } else {
      // If not, we're creating a new document.
      apiBridge = apiBridge.create(document)
    }

    return apiBridge.then(response => {
      if (response.results && response.results.length) {
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
        // Some other type of error occurred. We display a generic message.
        alert('The document was not saved.')
      }
    })
  }

  // Renders a field, deciding which component to use based on the field type
  renderField(field) {
    const {document, app} = this.props.state
    const hasError = document.validationErrors[field._id]
    const {hasTriedSubmitting} = this.state

    // As per API docs, validation messages are in the format "must be xxx", which
    // assumes that something (probably the name of the field) will be prepended to
    // the string to form a final error message. For this reason, we're prepending
    // the validation message with "This field", but this is something that we can
    // easily revisit.
    const error = typeof hasError === 'string' ? 'This field ' + hasError : hasError

    if (field.publish) {
      // console.log(field.publish)
    }
    const fieldType = field.publish && field.publish.subType ? field.publish.subType : field.type

    // console.log(fieldType)

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
            <FieldImage
              error={error}
              config={app.config}
              onError={this.handleFieldError.bind(this)}
              value={document.local[field._id]}
              schema={field}
            />
          )

          break
    }

    return fieldElement ? <div class={styles.field}>{fieldElement}</div> : null
  }

  // Handles the callback that fires whenever a field changes and the new value is ready
  // to be sent to the store
  handleFieldChange(fieldName, value) {
    const {actions} = this.props

    actions.updateLocalDocument({
      [fieldName]: value
    })
  }

  // Handles the callback that fires whenever there's a new validation error in a field or
  // when a validation error has been cleared
  handleFieldError(fieldName, hasError, value) {
    const {actions} = this.props

    actions.setFieldErrorStatus(fieldName, value, hasError)
  }

  // Handles the save operation
  handleSave(saveMode) {
    const {
      collection,
      documentId,
      group,
      section
    } = this.props

    this.setState({
      hasTriedSubmitting: true
    })

    switch (saveMode) {
      // Save
      case 'save':
        return this.saveDocument(documentId).then(newDocumentId => {
          // If we're creating a new document (either by starting a blank one or by
          // duplicating an existing one), we redirect to the new document ID.
          if (documentId !== newDocumentId) {
            route(buildUrl(group, collection, 'document', 'edit', newDocumentId, section))
          }

          // (!) TO DO: Replace with toaster.
          alert(`The document has been ${documentId ? 'updated' : 'created'} successfully.`)
        })

      // Save and create new
      case 'saveAndCreateNew':
        return this.saveDocument(documentId).then(newDocumentId => {
          route(buildUrl(group, collection, 'document', 'new'))

          // (!) TO DO: Replace with toaster.
          alert(`The document has been ${documentId ? 'updated' : 'created'} successfully.`)
        })

      // Save and go back
      case 'saveAndGoBack':
        return this.saveDocument(documentId).then(newDocumentId => {
          route(buildUrl(group, collection, 'documents'))

          // (!) TO DO: Replace with toaster.
          alert(`The document has been ${documentId ? 'updated' : 'created'} successfully.`)
        })

      // Save as duplicate
      case 'saveAsDuplicate':
        return this.saveDocument().then(newDocumentId => {
          route(buildUrl(group, collection, 'document', 'edit', newDocumentId, section))

          // (!) TO DO: Replace with toaster.
          alert(`The document has been created successfully.`)
        })
    }
  }
}

export default connectHelper(
  state => state,
  dispatch => bindActionCreators(documentActions, dispatch)
)(DocumentEdit)
