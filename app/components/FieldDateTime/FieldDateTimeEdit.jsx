import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'
import TextInputWithDatePicker from 'components/TextInputWithDatePicker/TextInputWithDatePicker'

/**
 * Component for API fields of type DateTime
 */
export default class FieldDateTimeEdit extends React.Component {
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
     * Whether the field is read-only.
     */
    readOnly: proptypes.bool,

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
    value: proptypes.oneOfType([proptypes.number, proptypes.string])
  }

  handleChange(newValue) {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, newValue)
    }
  }

  render() {
    const {
      comment,
      config,
      displayName,
      error,
      readOnly,
      required,
      schema,
      value
    } = this.props
    const commentString =
      comment || (required && 'Required') || (readOnly && 'Read only') || null
    const format = schema.format || config.formats.date.long

    return (
      <Label
        comment={commentString}
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        label={displayName}
      >
        <TextInputWithDatePicker
          format={format}
          onChange={this.handleChange.bind(this)}
          onKeyUp={this.handleChange.bind(this)}
          readOnly={readOnly}
          value={value}
        />
      </Label>
    )
  }
}
