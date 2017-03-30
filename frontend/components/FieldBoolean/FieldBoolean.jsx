'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Checkbox from 'components/Checkbox/Checkbox'
import Label from 'components/Label/Label'

/**
 * Component for API fields of type Boolean.
 */
export default class FieldBoolean extends Component {
  static propTypes = {
    /**
     * A callback function to be fired whenever the value changes.
     */
    onChange: proptypes.func,

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

    return (
      <Label
        compact={true}
        label={schema.label}
      >
        <Checkbox
          onChange={this.handleOnChange.bind(this)}
          value={value}
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
