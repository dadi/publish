'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Checkbox from 'components/Checkbox/Checkbox'
import Label from 'components/Label/Label'

/**
 * Component for API fields of type String
 */
export default class FieldBoolean extends Component {
  static propTypes = {
    /**
     * Whether the field contains a validation error.
     */
    error: proptypes.bool,

    /**
     * If true, validation will be executed immediately and not only when the
     * content of the field has changed.
     */
    forceValidation: proptypes.bool,

    /**
     * Callback to be executed when there is a change in the value of the field.
     */
    onChange: proptypes.func,

    /**
     * Callback to be executed when there is a new validation error in the field.
     */
    onError: proptypes.func,

    /**
     * The field value.
     */
    value: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  static defaultProps = {
    error: false,
    forceValidation: false,
    value: ''
  }

  // componentDidMount() {
  //   const {forceValidation, value} = this.props

  //   if (forceValidation) {
  //     this.validate(value)
  //   }
  // }

  // componentDidUpdate() {
  //   const {forceValidation, value} = this.props

  //   if (forceValidation) {
  //     this.validate(value)
  //   }
  // }

  render() {
    const {error, value, schema} = this.props
    const publishBlock = schema.publish || {}

    return (
      <Label
        compact={true}
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        label={schema.label}
      >
        <Checkbox value={value} />
      </Label>
    )
  }

  // handleOnChange(event) {
  //   const {onChange, schema} = this.props

  //   if (typeof onChange === 'function') {
  //     onChange.call(this, schema._id, event.target.value)
  //   }
  // }

  // validate(value) {
  //   const {error, onError, schema} = this.props
  //   const validation = schema && schema.validation
  //   const valueLength = typeof value === 'string' ? value.length : 0

  //   let validationMessage = typeof schema.message === 'string' && schema.message.length ? schema.message : null

  //   // As per API docs, validation messages are in the format "must be xxx", which
  //   // assumes that something (probably the name of the field) will be prepended to
  //   // the string to form a final error message. For this reason, we're prepending
  //   // the validation message with "This field", but this is something that we can
  //   // easily revisit.
  //   if (validationMessage) {
  //     validationMessage = 'This field ' + validationMessage
  //   }

  //   let hasErrorsAfterValidation = false

  //   // If the field is required, we add a minLength validation rule,
  //   // if there isn't one already.
  //   if (schema.required && !validation.minLength) {
  //     validation.minLength = 1
  //   }

  //   if (validation) {
  //     Object.keys(validation).forEach(validationRule => {
  //       switch (validationRule) {
  //         case 'minLength':
  //           if (valueLength < validation.minLength) {
  //             hasErrorsAfterValidation = validationMessage && !schema.required ? validationMessage : true
  //           }

  //           break

  //         case 'maxLength':
  //           if (valueLength > validation.maxLength) {
  //             hasErrorsAfterValidation = validationMessage || true
  //           }

  //           break

  //         case 'regex':
  //           const regex = new RegExp(validation.regex.pattern, validation.regex.flags)

  //           if (!regex.test(value)) {
  //             hasErrorsAfterValidation = validationMessage || true
  //           }

  //           break
  //       }
  //     })
  //   }

  //   if (typeof onError === 'function') {
  //     onError.call(this, schema._id, hasErrorsAfterValidation, value)
  //   }
  // }
}
