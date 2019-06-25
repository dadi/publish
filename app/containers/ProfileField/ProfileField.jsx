import * as fieldComponents from 'lib/field-components'
import * as userActions from 'actions/userActions'
import {connectRedux} from 'lib/redux'
import {connectRouter} from 'lib/router'
import Field from 'components/Field/Field'
import {getFieldType} from 'lib/fields'
import proptypes from 'prop-types'
import React from 'react'
import Validator from '@dadi/api-validator'

/**
 * Renders the appropriate input element(s) for editing a profile field
 * and handles any changes to its value as well as error states.
 */
class ProfileField extends React.Component {
  static propTypes = {
    /**
     * The global actions object.
     */
    actions: proptypes.object,

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

  // Handles the callback that fires whenever a field changes and the new value
  // is ready to be sent to the store.
  handleFieldChange(name, value, componentError) {
    const {actions} = this.props

    // Validating the field. If validation fails, `error` will be set. If it
    // passes, `error` will be `undefined`.
    this.validate(value)
      .catch(error => error)
      .then(error => {
        const update = {
          update: {
            [name]: value
          }
        }

        if (componentError || error) {
          update.error = {
            [name]: componentError || error.message || error
          }
        }

        actions.updateLocalUser(update)
      })
  }

  // Renders a field, deciding which component to use based on the field type.
  render() {
    const {field, onBuildBaseUrl, state} = this.props
    const {app, user} = state
    const {local, remote, validationErrors} = user
    const userData = Object.assign({}, remote, local)
    const isReadOnly = Boolean(field.publish && field.publish.readonly)
    const displayName = field.label || field._id

    // As per API docs, validation messages are in the format "must be xxx", which
    // assumes that something (probably the name of the field) will be prepended to
    // the string to form a final error message. For this reason, we're prepending
    // the validation message with "This field", but this is something we should
    // probably revisit.
    const error = (validationErrors && validationErrors[field._id]) || null
    const fieldType = getFieldType(field)
    const fieldComponentName = `Field${fieldType}`
    const FieldComponent =
      fieldComponents[fieldComponentName] &&
      fieldComponents[fieldComponentName].edit
    const fieldComment = field.comment || field.example

    if (!FieldComponent) {
      console.warn('Unknown field type:', fieldType)

      return null
    }

    return (
      <Field name={field._id}>
        <FieldComponent
          comment={fieldComment}
          config={app.config}
          displayName={displayName}
          documentId={userData._id}
          error={error}
          name={field._id}
          onBuildBaseUrl={onBuildBaseUrl}
          onChange={this.handleFieldChange.bind(this, field._id)}
          placeholder={field.placeholder}
          readOnly={isReadOnly}
          required={field.required}
          schema={field}
          value={userData[field._id]}
        />
      </Field>
    )
  }

  validate(value) {
    const {field} = this.props
    const arrayValue = Array.isArray(value) ? value : [value]
    const allValuesAreUploads =
      ['media', 'reference'].includes(field.type.toLowerCase()) &&
      arrayValue.every(value => {
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

export default connectRouter(connectRedux(userActions)(ProfileField))
