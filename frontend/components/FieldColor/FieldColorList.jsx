'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldColorList extends Component {
  static propTypes = {
    /**
     * App config.
     */
    config: proptypes.object,

    /**
     * The field schema.
     */
    schema: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.string
  }

  render() {
    const {config, schema, value} = this.props
    
    return value
  }
}
