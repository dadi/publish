'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Dropdown.css'

/**
 * A list of grouped links.
 */
export default class Dropdown extends Component {
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
    const {tooltip} = this.props

    let containerClass = new Style(styles, 'dropdown')

    containerClass.addIf(`dropdown-tooltip`, tooltip)
      .addIf(`dropdown-tooltip-${tooltip}`, tooltip)

    return (
      <ul class={containerClass.getClasses()}>
        {this.props.children}
      </ul>
    )
  }
}
