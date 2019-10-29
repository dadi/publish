import DateTime from 'lib/datetime'
import proptypes from 'prop-types'
import React from 'react'

/**
 * Component for rendering API fields of type DateTime in a filter.
 */
export default class FieldDateTimeFilter extends React.Component {
  static propTypes = {
    /**
     * App config.
     */
    config: proptypes.object,

    /**
     * Node with rendered field name.
     */
    nodeField: proptypes.node,

    /**
     * Node with rendered filter operator.
     */
    nodeOperator: proptypes.node,

    /**
     * Field value.
     */
    value: proptypes.number
  }

  render() {
    const {config = {}, nodeField, nodeOperator, value} = this.props
    const formats = config.formats || {}
    const date = formats.date || {}
    const dateTime = new DateTime(value)

    return (
      <>
        {nodeField}
        {nodeOperator}
        {dateTime.format(date.short)}
      </>
    )
  }
}
