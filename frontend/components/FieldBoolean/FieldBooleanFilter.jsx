'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import TextInput from 'components/TextInput/TextInput'

/**
 * Component for rendering API fields of type String in a filter.
 */
export default class FieldBooleanFilter extends Component {
  static propTypes = {
   
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {
      analyserStyles,
      containerStyles,
      onTypeChange,
      onValueChange,
      handleValueChange,
      type,
      value,
      valueStyles
    } = this.props

    return (
        <div class={containerStyles}>
          <select
            class={analyserStyles}
            onChange={this.handleValueChange.bind(this)}
          >
            <option
              selected={value === true}
              value="true"
            >Yes</option>
            <option
              selected={value === false}
              value="false"
            >No</option>
            ))}
          </select>
        </div>
    )
  }

  handleValueChange(event) {
    const {onValueChange} = this.props
    const value = !Boolean(event.target.selectedIndex)
    
    onValueChange(value)
  }
}
