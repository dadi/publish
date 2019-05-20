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
            [this.name]: this.value
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
      let update = {
        contentKey,
        update: {
          [name]: value
        }
      }

      if (error) {
        update.error = {
          [name]: error.message || error
        }
      }

      actions.updateLocalDocument(update)
    })
  }

  // Renders a field, deciding which component to use based on the field type.
  render() {
    const {
      collection,
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
    const fieldType = getFieldType(field)
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
          collection={collection}
          comment={fieldComment}
          config={app.config}
          displayName={displayName}
          documentId={documentData._id}
          error={error}
          meta={documentMetadata[fieldName]}
          name={fieldName}
          onBuildBaseUrl={onBuildBaseUrl}
          onChange={this.handleFieldChange.bind(this, fieldName)}
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
    const {field} = this.props
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
    })
  }
}

export default connectRouter(connectRedux(
  documentActions
)(DocumentField))
