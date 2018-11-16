'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'
import TextInput from 'components/TextInput/TextInput'

/**
 * Component for rendering API fields of type String in a filter.
 */
export default class FieldStringFilter extends Component {
  static propTypes = {}

  render() {
    const {
      onUpdate,
      value
    } = this.props

    return (
      <TextInput
        onInput={event => onUpdate(event.target.value)}
        placeholder="Search value"
        value={value}
      />
    )
  }
}
