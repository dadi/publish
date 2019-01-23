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
     * The text to be rendered on the top-right corner of the field.
     */
    comment: proptypes.string,

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
    value: null
  }

  constructor(props) {
    super(props)

    this.state.hasFocus = false
  }

  render() {
    let {
      comment,
      displayName,
      error,
      name,
      required,
      schema,
      value
    } = this.props
    const {hasFocus} = this.state
    const publishBlock = schema.publish || {}

    comment = comment || (required && 'Required')
    
    return (
      <Label
        error={Boolean(error)}
        errorMessage={typeof error === 'string' ? error : null}
        hasFocus={hasFocus}
        label={displayName}
        comment={comment}
      >
        <TextInput
          name={name}
          onBlur={this.handleFocusChange.bind(this, false)}
          onInput={this.handleOnChange.bind(this)}
          onFocus={this.handleFocusChange.bind(this, true)}
          readonly={publishBlock.readonly === true}
          type="number"
          value={value}
        />
      </Label>
    )
  }

  handleFocusChange(hasFocus) {
    this.setState({
      hasFocus
    })
  }

  handleOnChange(event) {
    const {name, onChange, schema, value} = this.props
    const newValue = parseFloat(event.target.value)

    // We must check for two specific situations in which we don't want to
    // propagate the new value to the store:
    //
    // 1) The user inserted a negative sign (-) at position 0, in order to
    //    insert a negative number. When this happens, the `value` property
    //    will be an empty string, as the browser sanitisation routine kicks
    //    in.
    //
    // 2) The value after parsing is equal to the previous value. This can
    //    happen when composing decimal values – e.g. to insert the value
    //    1.05, the user will, at some point, try to change `1.` to `1.0`,
    //    which are casted to the same number. If all these intermediate
    //    steps are taken into account, it becomes impossible to insert that
    //    number.
    if (event.target.value === '' || newValue === value) {
      return
    }

    if (typeof onChange === 'function') {
      onChange.call(this, name, newValue)
    }
  }
}
