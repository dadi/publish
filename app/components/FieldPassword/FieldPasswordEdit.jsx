import * as Constants from 'lib/constants'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
import styles from './FieldPassword.css'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type Password
 */
export default class FieldPasswordEdit extends React.Component {
  static propTypes = {
    /**
     * The schema of the collection being edited.
     */
    collection: proptypes.object,

    /**
     * The application configuration object.
     */
    config: proptypes.object,

    /**
     * The human-friendly name of the field, to be displayed as a label.
     */
    displayName: proptypes.string,

    /**
     * The ID of the document being edited.
     */
    documentId: proptypes.string,

    /**
     * If defined, contains an error message to be displayed by the field.
     */
    error: proptypes.string,

    /**
     * The name of the field within the collection. May be a path using
     * dot-notation.
     */
    name: proptypes.string,

    /**
     * A callback to be fired whenever the value of the field changes. The
     * function will be called with the updated value as the first argument
     * and an optional error message as the second. This second argument gives
     * each field component the ability to perform their own validaton logic,
     * in addition to the central validation routine taking place upstream.
     */
    onChange: proptypes.func,

    /**
     * Whether the field is required.
     */
    required: proptypes.bool,

    /**
     * The field schema.
     */
    schema: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.string
  }

  static defaultProps = {
    error: false,
    value: ''
  }

  constructor(props) {
    super(props)

    this.state = {
      value: '',
      valueConfirm: ''
    }
  }

  handleOnChange(field, event) {
    const {onChange} = this.props

    this.setState(
      {
        [field]: event.target.value
      },
      () => {
        const errors = this.validate(this.state)

        if (typeof onChange === 'function') {
          onChange.call(this, this.state.value, errors)
        }
      }
    )
  }

  render() {
    const {displayName, error, name, schema} = this.props
    const {value, valueConfirm} = this.state
    const {requireConfirmation} = schema.publish || {}
    const hasPasswordMismatch = error === Constants.ERROR_PASSWORD_MISMATCH
    const hasCustomError = Boolean(error && !hasPasswordMismatch)

    return (
      <div>
        <Label
          className={styles.label}
          error={hasCustomError}
          errorMessage={hasCustomError ? error : null}
          label={displayName}
        >
          <TextInput
            name={name}
            onChange={this.handleOnChange.bind(this, 'value')}
            placeholder={schema.placeholder}
            ref={element => (this.valueRef = element)}
            type='password'
            value={value}
          />
        </Label>

        {requireConfirmation && (
          <Label
            className={styles.label}
            error={hasPasswordMismatch}
            errorMessage={
              hasPasswordMismatch ? 'The passwords must match' : null
            }
            label={`${displayName} (confirm)`}
          >
            <TextInput
              name={`${name}-confirm`}
              onChange={this.handleOnChange.bind(this, 'valueConfirm')}
              placeholder={schema.placeholder}
              ref={element => (this.valueConfirmRef = element)}
              type='password'
              value={valueConfirm}
            />
          </Label>
        )}
      </div>
    )
  }

  validate({value, valueConfirm}) {
    const {schema} = this.props
    const {requireConfirmation} = schema.publish || {}

    if (
      requireConfirmation &&
      value.length > 0 &&
      valueConfirm.length > 0 &&
      value !== valueConfirm
    ) {
      return Constants.ERROR_PASSWORD_MISMATCH
    }
  }
}
