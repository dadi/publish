'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

/**
 * Component for rendering API fields of type Boolean on a list view.
 */
export default class FieldBooleanListView extends Component {
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

  render() {
    const {value} = this.props

    return value ? 'Yes' : 'No'
  }
}
