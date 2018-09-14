'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './FieldPassword.css'

import * as Constants from 'lib/constants'

import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type Password
 */
export default class FieldPasswordEdit extends Component {
  static propTypes = {
    /**
     * The name of the collection being edited, as per the URL.
     */
    collection: proptypes.string,

    /**
     * A subset of the app config containing data specific to this field type.
     */
    config: proptypes.object,

    /**
     * The schema of the API being used.
     */
    currentApi: proptypes.object,

    /**
     * The schema of the collection being edited.
     */
    currentCollection: proptypes.object,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * If defined, contains an error message to be displayed by the field.
     */
    error: proptypes.string,

    /**
     * Whether the field should be validated as soon as it mounts, rather than
     * waiting for a change event.
     */
    forceValidation: proptypes.bool,

    /**
     * If defined, specifies a group where the current collection belongs.
     */
    group: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * a successful state. The function receives the name of the field and the
     * new value as arguments.
     */
    onChange: proptypes.string,

    /**
     * A callback to be fired whenever the field wants to update its value to
     * or from an error state. The function receives the name of the field, a
     * Boolean value indicating whether or not there's an error and finally the
     * new value of the field.
     */
    onError: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.bool
  }

  static defaultProps = {
    error: false,
    forceValidation: false,
    value: ''
  }

  constructor(props) {
    super(props)

    this.state = {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirm: ''
    }
  }

  componentDidMount() {
    const {forceValidation, value} = this.props

    if (forceValidation) {
      this.validate(value)
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {forceValidation, value} = this.props

    if (!prevProps.forceValidation && forceValidation) {
      this.validate(value)
    }
  }

  render() {
    const {
      error,
      schema
    } = this.props
    const {
      currentPassword,
      forceValidation,
      newPassword,
      newPasswordConfirm
    } = this.state
    const publishBlock = schema.publish || {}
    const wrongPassword = error && error.includes(Constants.ERROR_WRONG_PASSWORD)
    const passwordMismatch = error && error.includes(Constants.ERROR_PASSWORD_MISMATCH)
    const missingFields = error && error.includes(Constants.ERROR_MISSING_FIELDS)

    return (
      <div>
        <Label
          className={styles.label}
          error={wrongPassword || (missingFields && currentPassword.length === 0)}
          errorMessage={wrongPassword && 'This password is incorrect'}
          label={`Current ${(schema.label || '').toLowerCase()}`}
        >
          <TextInput
            onChange={this.handleOnChange.bind(this, 'currentPassword')}
            onKeyUp={this.handleKeyUp.bind(this, 'currentPassword')}
            placeholder={schema.placeholder}
            type="password"
            value={currentPassword}
          />
        </Label>

        <Label
          className={styles.label}
          error={missingFields && newPassword.length === 0}
          label={`New ${(schema.label || '').toLowerCase()}`}
        >
          <TextInput
            onChange={this.handleOnChange.bind(this, 'newPassword')}
            onKeyUp={this.handleKeyUp.bind(this, 'newPassword')}
            placeholder={schema.placeholder}
            ref={element => this.newPasswordRef = element}
            type="password"
            value={newPassword}
          />
        </Label>

        <Label
          className={styles.label}
          error={passwordMismatch || (missingFields && newPasswordConfirm.length === 0)}
          errorMessage={passwordMismatch && 'The passwords must match'}
          label={`New ${(schema.label || '').toLowerCase()} (confirm)`}
        >
          <TextInput
            onChange={this.handleOnChange.bind(this, 'newPasswordConfirm')}
            onKeyUp={this.handleKeyUp.bind(this, 'newPasswordConfirm')}
            placeholder={schema.placeholder}
            ref={element => this.newPasswordConfirmRef = element}
            type="password"
            value={newPasswordConfirm}
          />
        </Label>
      </div>
    )
  }

  handleKeyUp(field, event) {
    const {
      error,
      onError,
      schema
    } = this.props
    const {
      newPassword
    } = this.state
    const wrongPassword = error && error.includes(Constants.ERROR_WRONG_PASSWORD)

    this.setState({
      [field]: event.target.value
    })

    this.validate()

    if (wrongPassword && field === 'currentPassword') {
      onError.call(this, schema._id, false, newPassword)
    }
  }

  handleOnChange(field, event) {
    const {onChange, schema} = this.props
    const {
      currentPassword,
      forceValidation,
      newPassword,
      newPasswordConfirm
    } = this.state

    this.validate()

    if (typeof onChange === 'function') {
      // When updating the password, we need to send two values: the current
      // password and the new one, and the API hook needs to confirm the former
      // is correct before updating the document. To achieve this, we send both
      // values as a JSON-stringified object and decode them on API-side.
      const combinedValue = currentPassword.length && newPassword.length ?
        JSON.stringify({
          current: currentPassword,
          new: newPassword
        }) : null

      onChange.call(this, schema._id, combinedValue, false)
    }
  }

  validate() {
    const {
      error,
      onError,
      schema
    } = this.props
    const {
      currentPassword,
      forceValidation,
      newPassword,
      newPasswordConfirm
    } = this.state

    let validationErrors = error && error.includes(Constants.ERROR_WRONG_PASSWORD)
      ? [Constants.ERROR_WRONG_PASSWORD]
      : []

    if (
      forceValidation || (newPasswordConfirm.length > 0) &&
      newPassword !== newPasswordConfirm
    ) {
      validationErrors.push(Constants.ERROR_PASSWORD_MISMATCH)
    }

    let lengths = 0

    if (currentPassword.length) {
      lengths++
    }

    if (newPassword.length) {
      lengths++
    }

    if (newPasswordConfirm.length) {
      lengths++
    }

    if (lengths > 0 && lengths < 3) {
      validationErrors.push(Constants.ERROR_MISSING_FIELDS)
    }

    const hasValidationErrors = (validationErrors.length > 0) && validationErrors

    if (typeof onError === 'function') {
      onError.call(this, schema._id, hasValidationErrors, newPassword)
    }
  }
}
