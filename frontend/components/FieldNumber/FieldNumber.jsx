'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Label from 'components/Label/Label'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for API fields of type Number
 */
export default class FieldNumber extends Component {
  render() {
    const {error, schema, value} = this.props
    const publishBlock = schema.publish || {}

    return (
      <Label
        error={error}
        errorMessage={typeof error === 'string' ? error : null}
        label={schema.label}
        comment={schema.required ? 'Required' : 'Optional'}
      >
        <TextInput
          onChange={this.handleOnChange.bind(this)}
          readonly={publishBlock.readonly === true}
          type="number"
          value={value}
        />
      </Label>
    )
  }

  handleOnChange(event) {
    const {onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, event.target.value)
    }
  }
}
