import Toggle from 'components/Toggle/Toggle'
import Label from 'components/Label/Label'
import proptypes from 'prop-types'
import React from 'react'

/**
 * Component for API fields of type Boolean.
 */
export default class FieldBooleanEdit extends React.Component {
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
    value: proptypes.bool
  }

  static defaultProps = {
    value: false
  }

  handleOnChange(event) {
    const {onChange} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, event.target.checked)
    }
  }

  render() {
    const {displayName, hasUnsavedChanges, name, schema, value} = this.props
    const publishBlock = schema.publish || {}
    const readOnly = publishBlock.readonly === true

    return (
      <Label
        accent={hasUnsavedChanges ? 'info' : null}
        compact={true}
        label={displayName}
      >
        <Toggle
          name={name}
          onChange={this.handleOnChange.bind(this)}
          value={value}
          readOnly={readOnly}
        />
      </Label>
    )
  }
}
