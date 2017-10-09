'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import TextInput from 'components/TextInput/TextInput'

/**
 * Component for rendering API fields of type String in a filter.
 */
export default class FieldStringFilter extends Component {
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
     * Field type.
     */
    type: proptypes.string,

    /**
     * Field value.
     */
    value: proptypes.string,

    /**
     * Classes for the value input.
     */
    valueStyles: proptypes.string
  }

  constructor(props) {
    super(props)

    this.filterTypes = {
      '$eq': 'Equals',
      '$ne': 'Is not',
      '$regex': 'Contains'
    }
  }

  render() {
    const {
      analyserStyles,
      containerStyles,
      type,
      value,
      valueStyles
    } = this.props

    return (
        <div class={containerStyles}>
          <select
            class={analyserStyles}
            onChange={this.handleChange.bind(this, 'type')}
            value={type}
          >
            <option disabled selected value>Select a type</option>

            {Object.keys(this.filterTypes).map(key => (
              <option
                key={key}
                value={key}
              >
                {this.filterTypes[key]}
              </option>
            ))}
          </select>
          <TextInput
            className={valueStyles}
            onChange={this.handleChange.bind(this, 'value')}
            onKeyUp={this.handleChange.bind(this, 'value')}
            placeholder="Search value"
            value={value}
          />
        </div>
    )
  }

  handleChange(elementId, event) {
    const {onUpdate, index} = this.props

    onUpdate({
      [elementId]: event.target.value
    }, index)
  }
}
