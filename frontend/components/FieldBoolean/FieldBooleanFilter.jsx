'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

/**
 * Component for rendering API fields of type Boolean in a filter.
 */
export default class FieldBooleanFilter extends Component {
  static propTypes = {
    /**
     * Classes for the analyser selection.
     */
    analyserStyles: proptypes.string,

    /**
     * Classes for the container.
     */
    containerStyles: proptypes.string,

    /**
     * Filter array position.
     */
    index: proptypes.number,

    /**
     * Input update callback.
     */
    onUpdate: proptypes.func,

    /**
     * Field value.
     */
    value: proptypes.string
  }

  constructor(props) {
    super(props)
  }

  render() {
    const {
      analyserStyles,
      containerStyles,
      onUpdate,
      value
    } = this.props

    return (
        <div class={containerStyles}>
          <select
            class={analyserStyles}
            onChange={this.handleChange.bind(this, 'value')}
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

  handleChange(elementId, event) {
    const {onUpdate, index} = this.props
    const value = !Boolean(event.target.selectedIndex)

    onUpdate({
      [elementId]: value
    }, index)
  }
}
