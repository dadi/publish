'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Checkbox from 'components/Checkbox/Checkbox'
import Label from 'components/Label/Label'

/**
 * Component for API fields of type String
 */
export default class FieldBoolean extends Component {
  static propTypes = {
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
    const {value, schema} = this.props

    return (
      <Label
        compact={true}
        label={schema.label}
      >
        <Checkbox value={value} />
      </Label>
    )
  }
}
