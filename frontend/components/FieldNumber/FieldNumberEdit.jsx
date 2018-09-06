'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type Number.
 */
export default class FieldNumberEdit extends Component {
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
     * Whether the field should be validated as soon as it mounts, rather than
     * waiting for a change event.
     */
    forceValidation: proptypes.bool,

    /**
     * If defined, specifies a group where the current collection belongs.
     */
    group: proptypes.string,

    /**
     * The name of the field within the collection. May be a path using
     * dot-notation.
     */
    name: proptypes.string,

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
    value: proptypes.bool
  }

  static defaultProps = {
    error: false,
    forceValidation: false,
    value: null
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
      displayName,
      error,
      required,
      schema,
      value
    } = this.props
    const publishBlock = schema.publish || {}

    return (
      <Label
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        label={displayName}
        comment={required && 'Required'}
      >
        <TextInput
          onChange={this.handleOnChange.bind(this)}
          onKeyUp={this.handleOnKeyUp.bind(this)}
          readonly={publishBlock.readonly === true}
          type="number"
          value={value}
        />
      </Label>
    )
  }

  getValueOfInput(input) {
    return parseFloat(input.value)
  }

  handleOnChange(event) {
    const {name, onChange, schema} = this.props
    const value = this.getValueOfInput(event.target)

    this.validate(value)

    if (typeof onChange === 'function') {
      onChange.call(this, name, parseFloat(event.target.value))
    }
  }

  handleOnKeyUp(event) {
    const value = this.getValueOfInput(event.target)

    this.validate(value)
  }

  validate(value) {
    const {name, onError, required, schema} = this.props

    const hasValidationErrors = required && (isNaN(value)
      || typeof value !== 'number') 
    //{To-Do}: add findValidationErrorsInValue method for further validation checks 

    if (typeof onError === 'function') {
        onError.call(this, name, hasValidationErrors, value)
    }
  }
}
