import React from 'react'
import proptypes from 'prop-types'
import Style from 'lib/Style'
import styles from './FieldString.css'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for rendering API fields of type String in a filter.
 */
export default class FieldStringFilter extends React.Component {
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
    if (typeof value !== 'string') {
      onUpdate(null)
    }
  }

  render() {
    const {
      onUpdate,
      stylesTextInput,
      value
    } = this.props

    return (
      <TextInput
        className={styles['filter-input']}
        onInput={event => onUpdate(event.target.value)}
        placeholder="Search value"
        value={value}
      />
    )
  }
}
