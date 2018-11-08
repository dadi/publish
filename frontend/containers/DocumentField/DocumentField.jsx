import {h, Component} from 'preact'
import proptypes from 'proptypes'
import {bindActionCreators} from 'redux'
import {connectHelper} from 'lib/util'

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

  getFieldType(schema) {
    let fieldType = (schema.publish && schema.publish.subType) ?
      schema.publish.subType :
      schema.type

    if (fieldType === 'Image') {
      fieldType = 'Media'
    }

    return fieldType
  }  

  // Handles the callback that fires whenever a field changes and the new value
  // is ready to be sent to the store.
  handleFieldChange(fieldName, value, persistInLocalStorage = true) {
    const {
      actions,
      collection
    } = this.props

    actions.updateLocalDocument({
      [fieldName]: value
    }, {
      path: collection.path,
      persistInLocalStorage
    })
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
      collection,
      documentId,
      field,
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
    const fieldType = this.getFieldType(field)
    const fieldComponentName = `Field${fieldType}`
    const FieldComponent = fieldComponents[fieldComponentName] &&
      fieldComponents[fieldComponentName].edit
    const fieldComment = field.comment || field.example

    if (!FieldComponent) {
      console.warn('Unknown field type:', fieldType)

      return null
    }

    return (
      <Field
        isDisabled={isTranslation && !isTranslatable}
        name={fieldName}
      >
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
          name={fieldName}
          onBuildBaseUrl={onBuildBaseUrl}
          onChange={this.handleFieldChange.bind(this)}
          onError={this.handleFieldError.bind(this)}
          placeholder={placeholder}
          required={field.required && !isTranslation}
          schema={field}
          value={value}
        />      
      </Field>
    )
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
