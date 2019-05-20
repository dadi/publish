import React from 'react'
import proptypes from 'prop-types'

import DateTime from 'lib/datetime'

/**
 * Component for rendering API fields of type String on a list view.
 */
export default class FieldDateTimeList extends React.Component {
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
    value: proptypes.oneOfType([
      proptypes.number,
      proptypes.string
    ])
  }

  render() {
    const {config, value} = this.props

    // If there's no value, we return `null`.
    if (!value) return null

    const dateTimeObj = new DateTime(value)
    
    return (dateTimeObj.isValid() && dateTimeObj.format(config.formats.date.long)) || value
  }
}
