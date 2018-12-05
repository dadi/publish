'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Field.css'

/**
 * A generic wrapper for a field.
 */
export default class Field extends Component {
  static propTypes = {
    /**
     * The field component.
     */
    children: proptypes.node,

    /**
     * Whether the field is disabled.
     */
    isDisabled: proptypes.bool,

    /**
     * The name of the field.
     */
    name: proptypes.string
  }

  static defaultProps = {
    accent: 'error'
  }

  render() {
    const {
      children,
      isDisabled,
      name
    } = this.props
    const fieldStyles = new Style(styles, 'field')
      .addIf('field-disabled', isDisabled)

    return (
      <div class={fieldStyles.getClasses()} data-field-name={name}>
        {children}
      </div>
    )
  }
}
