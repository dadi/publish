import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Dropdown.css'

/**
 * A list of grouped links.
 */
export default class Dropdown extends React.Component {
  static propTypes = {
    /**
     * The list of `DropdownItem` elements to be rendered.
     */
    children: proptypes.node,

    /**
     * If present, renders a tooltip on the bottom of the container.
     */
    tooltip: proptypes.oneOf(['left', 'right'])
  }

  static defaultProps = {
    tooltip: null
  }

  render() {
    const {children, tooltip} = this.props
    const container = new Style(styles, 'dropdown')
      .addIf(`dropdown-tooltip`, tooltip)
      .addIf(`dropdown-tooltip-${tooltip}`, tooltip)

    return <ul className={container.getClasses()}>{children}</ul>
  }
}
