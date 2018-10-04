'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import DateTime from 'lib/datetime'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldDateTimeList extends Component {
  static propTypes = {
    /**
     * App config.
     */
    config: proptypes.object,

    /**
     * The field value.
     */
    value: proptypes.string,

    /**
     * The field schema.
     */
    schema: proptypes.object
  }

  render() {
    const {config, schema, value} = this.props

    // If there's no value, we return `null`.
    if (!value) return null

    let dateObj = null

    if (value) {
      const dateTimeObj = new DateTime(value)

      if (dateTimeObj.isValid()) {
        dateObj = dateTimeObj
      }
    }
    
    return (dateObj && dateObj.format(config.formats.date.long)) || value
  }
}
