import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type Number.
 */
export default class FieldNumberEdit extends React.Component {
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
     * Whether the field should be validated as soon as it mounts, rather than
     * waiting for a change event.
     */
    forceValidation: proptypes.bool,

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
    value: proptypes.number
  }

  static defaultProps = {
    error: false,
    value: null
  }

  constructor(props) {
    super(props)

    this.state = {
      hasFocus: false,
      internalValue: null
    }
  }

  handleFocusChange(hasFocus) {
    this.setState({
      hasFocus
    })
  }

  handleOnChange(event) {
    const {onChange, value} = this.props
    const {internalValue} = this.state
    const newValue =
      event.target.value !== '' ? parseFloat(event.target.value) : null

    // The value after parsing is equal to the previous value. This can
    // happen when composing decimal values – e.g. to insert the value
    // 1.05, the user will, at some point, try to change `1.` to `1.0`,
    // which are casted to the same number. When this happens, we don't
    // want to propagate the new value upstream just yet.
    if (newValue === value) {
      return this.setState({
        internalValue: event.target.value
      })
    } else if (internalValue !== null) {
      this.setState({
        internalValue: null
      })
    }

    if (typeof onChange === 'function') {
      onChange.call(this, newValue)
    }
  }

  render() {
    const {
      comment,
      displayName,
      error,
      name,
      readOnly,
      required,
      schema,
      value
    } = this.props
    const {hasFocus, internalValue} = this.state
    const publishBlock = schema.publish || {}
    const commentString =
      comment || (required && 'Required') || (readOnly && 'Read only') || null

    return (
      <Label
        comment={commentString}
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
      >
        <TextInput
          name={name}
          onBlur={this.handleFocusChange.bind(this, false)}
          onInput={this.handleOnChange.bind(this)}
          onFocus={this.handleFocusChange.bind(this, true)}
          readOnly={publishBlock.readonly === true}
          type="number"
          value={(internalValue || value || '').toString()}
        />
      </Label>
    )
  }
}
