import proptypes from 'prop-types'
import React from 'react'
import {Select} from '@dadi/edit-ui'

/**
 * Component for rendering API fields of type Boolean in a filter.
 */
export default class FieldBooleanFilter extends React.Component {
  static propTypes = {
    /**
     * Callback to fire every time the value changes. The function is called
     * with the new value as the only parameter.
     */
    onUpdate: proptypes.func,

    /**
     * The filter value.
     */
    value: proptypes.bool
  }

  coerceToBoolean(value) {
    if (typeof value === 'boolean') {
      return value
    }

    return value === 'true'
  }

  componentDidMount() {
    const {onUpdate, value} = this.props

    // If the initial value isn't accepted for this field type,
    // we update it with one that is and propagate it to the
    // parent.
    if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
      onUpdate(this.coerceToBoolean(value))
    }
  }

  render() {
    const {onUpdate, value} = this.props

    return (
      <Select
        onChange={e => onUpdate(this.coerceToBoolean(e.target.value))}
        options={[{value: true, label: 'Yes'}, {value: false, label: 'No'}]}
        value={this.coerceToBoolean(value)}
      />
    )
  }
}
