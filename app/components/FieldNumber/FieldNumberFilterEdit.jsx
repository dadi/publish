import proptypes from 'prop-types'
import React from 'react'
import styles from './FieldNumber.css'
import {TextInput} from '@dadi/edit-ui'

/**
 * Component for rendering API fields of type Number in a filter.
 */
export default class FieldNumberFilter extends React.Component {
  static propTypes = {
    /**
     * Callback to fire every time the value changes. The function is called
     * with the new value as the only parameter.
     */
    onUpdate: proptypes.func,

    /**
     * The filter value.
     */
    value: proptypes.string
  }

  componentDidMount() {
    const {onUpdate, value} = this.props

    // If the initial value isn't accepted for this field type,
    // we update it with one that is and propagate it to the
    // parent.
    if (typeof value !== 'number') {
      onUpdate(null)
    }
  }

  handleChange(event) {
    const {onUpdate} = this.props
    let value = isNaN(event.target.value) ? 0 : Number(event.target.value)

    if (!event.target.value.length) {
      value = null
    }

    onUpdate(value)
  }

  render() {
    const {value} = this.props

    return (
      <TextInput
        className={styles['filter-input']}
        onChange={this.handleChange.bind(this)}
        placeholder="Search value"
        type="number"
        value={value}
      />
    )
  }
}
