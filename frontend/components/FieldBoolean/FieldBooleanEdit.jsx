'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Checkbox from 'components/Checkbox/Checkbox'
import Label from 'components/Label/Label'

/**
 * Component for API fields of type Boolean.
 */
export default class FieldBooleanEdit extends Component {
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
    value: false
  }

  render() {
    const {onChange, value, schema} = this.props

    const publishBlock = schema.publish
    const readOnly = publishBlock.readonly === true

    return (
      <Label
        compact={true}
        label={schema.label}
      >
        <Checkbox
          onChange={this.handleOnChange.bind(this)}
          value={value}
          readonly={readOnly}
        />
      </Label>
    )
  }

  handleOnChange(event) {
    const {onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, event.target.checked)
    }
  }
}
