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
     * The field value.
     */
    value: proptypes.bool,

    /**
     * The field schema.
     */
    schema: proptypes.object
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

  componentDidMount() {
    const {onChange, schema, value} = this.props

    // Because Boolean fields don't have an "unset" state, we need to register
    // the state of the field as soon as it's mounted, and not just when its
    // value changes.
    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, value)
    }
  }

  handleOnChange(event) {
    const {onChange, schema} = this.props

    if (typeof onChange === 'function') {
      onChange.call(this, schema._id, event.target.checked)
    }
  }
}
