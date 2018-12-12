import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {batchActions} from 'lib/redux'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'
import {getFieldType} from 'lib/fields'
import Validator from '@dadi/api-validator'

import * as documentActions from 'actions/documentActions'
import * as fieldComponents from 'lib/field-components'

import Field from 'components/Field/Field'

/**
 * Renders the appropriate input element(s) for editing a document field
 * and handles any changes to its value as well as error states.
 */
class DocumentField extends Component {
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
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * The schema of the field being edited.
     */
    field: proptypes.object,

    /**
    * A callback to be used to obtain the base URL for the given page, as
    * determined by the view.
    */
    onBuildBaseUrl: proptypes.func,

    /**
     * The global state object.
     */
    state: proptypes.object
  }

  constructor(props) {
    super(props)

    this.validator = new Validator()
  }

  componentDidUpdate(oldProps, oldState) {
    const {state} = this.props
    const {document} = state
    const {document: oldDocument} = oldProps.state

    if (oldDocument.saveAttempts === 0 && document.saveAttempts > 0) {
      this.validate(this.value).catch(error => {})
    }
  }

  // Handles the callback that fires whenever a field changes and the new value
  // is ready to be sent to the store.
  handleFieldChange(fieldName, value, persistInLocalStorage = true) {
    const {
      actions,
      collection,
      field,
      state
    } = this.props
    const {app, document} = state
    const hasError = document.validationErrors
      && document.validationErrors[this.name]

    // Validating the field.
    this.validate(value).then(() => {
      // Validation passed. We'll update the local document with the
      // new value.
      let actionQueue = [
        actions.updateLocalDocument.call(this, {
          path: collection.path,
          persistInLocalStorage,
          update: {
            [fieldName]: value
          }
        })
      ]

      // Do we have validation errors to clear?
      if (hasError) {
        actionQueue.push(
          actions.setFieldErrorStatus.call(this, fieldName, value, null)
        )
      }

      batchActions(actionQueue)
    }).catch(error => {})
  }

  // Handles the callback that fires whenever there's a new validation error
  // in a field or when a validation error has been cleared.
  handleFieldError(fieldName, hasError, value) {
    const {actions} = this.props

    actions.setFieldErrorStatus(fieldName, value, hasError)
  }  

  // Renders a field, deciding which component to use based on the field type.
  render() {
    const {
      api,
      collection,
      documentId,
      field,
      onBuildBaseUrl,
      state
    } = this.props

    if (!api || !collection) return null

    const {app, document} = state
    const hasAttemptedSaving = document.saveAttempts > 0
    const hasError = document.validationErrors
      && document.validationErrors[field._id]
    const documentData = Object.assign({}, document.remote, document.local)
    const documentMetadata = document.localMeta || {}
    const defaultApiLanguage = api.languages &&
      api.languages.find(language => language.default)
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
      let language = api.languages.find(language => {
        return language.code === currentLanguage
      })

      if (language) {
        displayName += ` (${language.name})`
      }

      fieldName += languageFieldCharacter + currentLanguage
      placeholder = documentData[field._id] || placeholder
    }

    // As per API docs, validation messages are in the format "must be xxx", which
    // assumes that something (probably the name of the field) will be prepended to
    // the string to form a final error message. For this reason, we're prepending
    // the validation message with "This field", but this is something that we can
    // easily revisit.
    const error = typeof hasError === 'string' ?
      'This field ' + hasError :
      hasError
    const fieldType = getFieldType(field)
    const fieldComponentName = `Field${fieldType}`
    const FieldComponent = fieldComponents[fieldComponentName] &&
      fieldComponents[fieldComponentName].edit
    const fieldComment = field.comment || field.example

    if (!FieldComponent) {
      console.warn('Unknown field type:', fieldType)

      return null
    }

    // Caching these value so that other lifecycle methods can use them.
    this.name = fieldName
    this.value = documentData[fieldName]

    return (
      <Field
        isDisabled={isTranslation && !isTranslatable}
        name={fieldName}
      >
        <FieldComponent
          collection={collection.slug}
          comment={fieldComment}
          config={app.config}
          currentApi={api}
          currentCollection={collection}
          displayName={displayName}
          documentId={documentId}
          error={error}
          forceValidation={hasAttemptedSaving}
          meta={documentMetadata[fieldName]}
          name={fieldName}
          onBuildBaseUrl={onBuildBaseUrl}
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
          placeholder={placeholder}
          required={field.required && !isTranslation}
          schema={field}
          value={documentData[fieldName]}
        />      
      </Field>
    )
  }

  validate(value) {
    const {
      actions,
      field,
      state
    } = this.props
    const {app, document} = state
    const hasError = document.validationErrors
      && document.validationErrors[this.name]

    console.log('Validating:', {field: this.name, value})

    return this.validator.validateValue({
      schema: field,
      value
    }).catch(error => {
      // Validation failed. We'll flag the error in the store.
      actions.setFieldErrorStatus(this.name, value, error.message)

      return Promise.reject(error)
    })
  }
}

export default connectHelper(
  state => ({
    api: state.api,
    app: state.app,
    document: state.document,
    router: state.router
  }),
  dispatch => bindActionCreators({
    ...documentActions
  }, dispatch)
)(DocumentField)
