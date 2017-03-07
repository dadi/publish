'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Table.css'

/**
 * A table row.
 */
export default class TableRowCell extends Component {
  static propTypes = {
    /**
     * When `true`, any empty row cells will be filled with a text element saying *None*.
     *
     * **NOTE:** This prop is automatically passed down by `<Table/>`.     
     */
    fillBlanks: proptypes.bool,

    /**
     * Whether the row is used to hold a selection checkbox.
     */
    select: proptypes.bool
  }

  static defaultProps = {
    fillBlanks: false,
    select: false
  }

  render() {
    let children = this.props.children
    let cellStyle = new Style(styles, 'cell')

    cellStyle.addIf('select-cell', this.props.select)
    
    if (!children.length && this.props.fillBlanks) {
      children = <span class={styles['row-cell-blank']}>None</span>
    }

    return (
      <td class={cellStyle.getClasses()}>
        {children}
      </td>
    )
  }
}
