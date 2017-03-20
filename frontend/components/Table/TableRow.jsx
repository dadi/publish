'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Table.css'

import TableRowCell from 'components/Table/TableRowCell'

/**
 * A table row.
 */
export default class TableRow extends Component {
  static propTypes = {
    /**
     * When `true`, any empty row cells will be filled with a text element saying *None*.
     *
     * **NOTE:** This prop is automatically passed down by `<Table/>`.     
     */
    fillBlanks: proptypes.bool,

    /**
     * A callback function to be executed when the selection checkbox is clicked.
     */
    onSelect: proptypes.func,    

    /**
     * Whether the row is currently selected.
     */
    selected: proptypes.bool,

    /**
     * The contents of the table row.
     */
    children: proptypes.node
  }

  static defaultProps = {
    fillBlanks: false,
    onSelect: null,
    selected: false
  }

  handleSelectClick(event) {
    const {onSelect, tableIndex} = this.props

    if (typeof onSelect === 'function') {
      onSelect.call(this, tableIndex, event)
    }
  }

  renderChildren() {
    return this.props.children.map(child => {
      child.attributes = child.attributes || {}
      child.attributes.fillBlanks = child.attributes.fillBlanks || this.props.fillBlanks

      return child
    })
  }

  render() {
    const {selectable, selected} = this.props

    let rowStyle = new Style(styles, 'row')

    rowStyle.addIf('row-selected', selected)

    return (
      <tr class={rowStyle.getClasses()}>
        {selectable &&
          <TableRowCell select={true}>
            <input
              checked={selected}
              class={styles.select}
              type="checkbox"
              onClick={this.handleSelectClick.bind(this)}
            />
          </TableRowCell>
        }
        {this.renderChildren()}
      </tr>
    )
  }
}
