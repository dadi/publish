import proptypes from 'proptypes'
import Field from 'components/Field/Field'
import Validator from '@dadi/api-validator'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'
import {getFieldType} from 'lib/fields'
import {h, Component} from 'preact'
import * as documentActions from 'actions/documentActions'
import * as fieldComponents from 'lib/field-components'

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
     * The field being edited.
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

  componentDidMount() {
    const {state} = this.props
    const {app, document} = state
    const hasError = document.validationErrors
      && document.validationErrors[this.name]

    // If we have just mounted the component and there's already an error
    // registered for it in the store, we should validate the field again
    // to ensure it isn't an error that carried on from a previous life of
    // the component (e.g. when the component is mounted/unmounted) as part
    // of the flow for selecting a reference document.
    if (hasError) {
      this.validate(this.value)
    }
  }

  componentDidUpdate(oldProps, oldState) {
    const {state} = this.props
    const {document} = state
    const {document: oldDocument} = oldProps.state

    if (oldDocument.saveAttempts === 0 && document.saveAttempts > 0) {
      this.validate(this.value)
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

    actions.updateLocalDocument({
      path: collection.path,
      persistInLocalStorage,
      update: {
        [fieldName]: value
      }
    })

    // Validating the field.
    this.validate(value)
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

    // Caching these value so that other lifecycle methods can use them.
    this.name = fieldName
    this.value = documentData[fieldName]

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

    const fieldProps = {
      collection: collection.slug,
      comment: fieldComment,
      config: app.config,
      currentApi: api,
      currentCollection: collection,
      displayName,
      documentId,
      error,
      forceValidation: hasAttemptedSaving,
      meta: documentMetadata[fieldName],
      name: fieldName,
      onBuildBaseUrl: onBuildBaseUrl,
      onChange: this.handleFieldChange.bind(this),
      onError: this.handleFieldError.bind(this),
      placeholder: placeholder,
      required: field.required && !isTranslation,
      schema: field,
      value: documentData[fieldName]
    }
    const wrapperProps = {
      isDisabled: isTranslation && !isTranslatable,
      name: fieldName
    }    
    const UserComponent = window.Publish.getFieldHandler(fieldType)

    if (UserComponent) {
      return (
        <UserComponent
          document={documentData}
          FieldComponent={FieldComponent}
          fieldProps={fieldProps}
          WrapperComponent={Field}
          wrapperProps={wrapperProps}
        />
      )
    }

    return (
      <Field {...wrapperProps}>
        <FieldComponent {...fieldProps}/>
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
    const arrayValue = Array.isArray(value)
      ? value
      : [value]
    const allValuesAreUploads = (['media', 'reference']).includes(
      field.type.toLowerCase()
    ) && arrayValue.every(value => {
      return value && value._previewData && value._file
    })

    // If we're looking at a media file that the user is trying to upload,
    // there's no point in sending it to the validator module because it
    // is in a format that the module will not understand, causing the
    // validation to fail.
    if (allValuesAreUploads) {
      return Promise.resolve()
    }

    return this.validator.validateValue({
      schema: field,
      value
    }).then(() => {
      // Validation passed. Do we have validation errors to clear?
      if (hasError) {
        actions.setFieldErrorStatus(this.name, value, null)
      }      
    }).catch(error => {
      // Validation failed. We'll flag the error in the store.
      actions.setFieldErrorStatus(this.name, value, error.message)
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
