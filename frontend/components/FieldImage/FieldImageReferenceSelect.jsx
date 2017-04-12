'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

/**
 * Component for rendering API fields of type Image on a reference field select
 * list view.
 */
export default class FieldImageReferenceSelect extends Component {
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
    const {
      data
    } = this.props
console.log('--->', data)
    return (
      <p>Hello!</p>
    )
  }
}
