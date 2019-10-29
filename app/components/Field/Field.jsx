import proptypes from 'prop-types'
import React from 'react'

import Style from 'lib/Style'
import styles from './Field.css'

/**
 * A generic wrapper for a field.
 */
export default class Field extends React.Component {
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
    const {children, isDisabled, name} = this.props
    const fieldStyles = new Style(styles, 'field').addIf(
      'field-disabled',
      isDisabled
    )

    return (
      <div className={fieldStyles.getClasses()} data-field-name={name}>
        {children}
      </div>
    )
  }
}
