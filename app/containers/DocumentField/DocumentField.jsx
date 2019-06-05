import * as documentActions from 'actions/documentActions'
import * as fieldComponents from 'lib/field-components'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import {getFieldType} from 'lib/fields'
import Field from 'components/Field/Field'
import proptypes from 'prop-types'
import React from 'react'
import Validator from '@dadi/api-validator'

/**
 * Renders the appropriate input element(s) for editing a document field
 * and handles any changes to its value as well as error states.
 */
class DocumentField extends React.Component {
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
     * The unique cache key for the document.
     */
    contentKey: proptypes.string,

    /**
     * The ID of the document being edited.
     */
    document: proptypes.object,

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

    const fieldType = getFieldType(props.field)
    const fieldComponentName = `Field${fieldType}`
    
    this.fieldComponent = fieldComponents[fieldComponentName]
    this.validator = new Validator()
  }

  componentDidUpdate(oldProps) {
    const {
      actions,
      contentKey,
      document
    } = this.props
    const {document: oldDocument} = oldProps

    // If we have just tried to save the document for the first time, we must
    // validate it and communicate to the store any validation errors.
    if (oldDocument.saveAttempts === 0 && document.saveAttempts > 0) {
      this.validate(this.value).catch(error => {
        actions.updateLocalDocument({
          contentKey,
          error: {
            [this.name]: error.message || error
          },
          update: {
            [this.name]: undefined
          }
        })
      })
    }
  }

  // Handles the callback that fires whenever a field changes and the new value
  // is ready to be sent to the store.
  handleFieldChange(name, value) {
    const {
      actions,
      contentKey
    } = this.props

    // Validating the field. If validation fails, `error` will be set. If it
    // passes, `error` will be `undefined`.
    this.validate(value).catch(error => error).then(error => {
      let data = {
        contentKey,
        update: {
          [name]: value
        }
      }

      if (error) {
        data.error = {
          [name]: error.message || error
        }
      }

      actions.updateLocalDocument(data)
    })
  }

  handleSaveCallbackRegister(callback) {
    const {actions, contentKey} = this.props

    actions.registerSaveCallback({
      callback,
      contentKey,
      fieldName: this.name
    })
  }

  handleValidationCallbackRegister(callback) {
    const {actions, contentKey} = this.props

    actions.registerValidationCallback({
      callback,
      contentKey,
      fieldName: this.name
    })
  }

  // Renders a field, deciding which component to use based on the field type.
  render() {
    const {
      collection,
      contentKey,
      document,
      field,
      onBuildBaseUrl,
      router,
      state
    } = this.props
    const {app} = state
    const {api} = app.config
    const {local, remote, validationErrors} = document
    const documentData = Object.assign({}, remote, local)
    const documentMetadata = document.localMeta || {}
    const defaultApiLanguage = api.languages &&
      api.languages.find(language => language.default)
    const {lang: currentLanguage} = router.search
    const isReadOnly = Boolean(
      field.publish && field.publish.readonly
    )
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
    // the validation message with "This field", but this is something we should
    // probably revisit.
    const error = validationErrors && validationErrors[field._id]
      ? `This field ${validationErrors[field._id]}`
      : null
    const FieldComponent = this.fieldComponent && this.fieldComponent.edit
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
          collection={collection}
          comment={fieldComment}
          config={app.config}
          contentKey={contentKey}
          displayName={displayName}
          documentId={documentData._id}
          error={error}
          meta={documentMetadata[fieldName]}
          name={fieldName}
          onBuildBaseUrl={onBuildBaseUrl}
          onChange={this.handleFieldChange.bind(this, fieldName)}
          onSaveRegister={this.handleSaveCallbackRegister.bind(this)}
          onValidateRegister={this.handleValidationCallbackRegister.bind(this)}
          placeholder={placeholder}
          readOnly={isReadOnly}
          required={field.required && !isTranslation}
          schema={field}
          value={documentData[fieldName]}
        />      
      </Field>
    )
  }

  validate(value) {
    const {contentKey, field: schema, state} = this.props
    const document = state.document[contentKey] || {}
    const {validationCallbacks = {}} = document

    // If the field defines its own validation function, we run it.
    if (typeof validationCallbacks[this.name] === 'function') {
      const validateFn = value => this.validator.validateValue({
        schema,
        value
      })

      return validationCallbacks[this.name].call(this, {
        schema,
        validateFn,
        value
      })
    }

    // If the component does not define its own validation function, we use
    // the api-validator module.
    return this.validator.validateValue({
      schema,
      value
    })
  }
}

export default connectRouter(connectRedux(
  documentActions
)(DocumentField))
