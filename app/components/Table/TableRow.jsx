import {Checkbox} from '@dadi/edit-ui'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Table.css'
import TableRowCell from 'components/Table/TableRowCell'

/**
 * A table row.
 */
export default class TableRow extends React.Component {
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
     * Whether the row is selectable.
     */
    selectable: proptypes.bool,

    /**
     * If the table allows multiple rows to be selected (multi), or if it has
     * exceeded the maximum number of selected rows (multiDisabled), or if the
     * the table only allows a single row to be selected (single).
     */
    selectableMode: proptypes.oneOf(['multi', 'multiDisabled', 'single']),

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
    selectable: true,
    selectableMode: 'multi',
    selected: false
  }

  constructor(props) {
    super(props)

    this.handleChildHover = isChildHovered =>
      this.setState({isHovered: !isChildHovered})
    this.hoverOn = () => this.setState({isHovered: true})
    this.hoverOff = () => this.setState({isHovered: false})
    this.markEvent = e => {
      e.__innerClick = true
    }

    this.state = {
      isHovered: false
    }
  }

  selectRow(event) {
    const {onSelect, tableIndex} = this.props

    if (typeof onSelect === 'function') {
      onSelect.call(this, tableIndex, !this.props.selected, event.shiftKey)
    }
  }

  renderChildren() {
    const {children, fillBlanks} = this.props

    return React.Children.map(children, child => {
      return React.cloneElement(child, {
        fillBlanks,
        onHover: this.handleChildHover
      })
    })
  }

  render() {
    const {onClick, selectable, selectableMode, selected} = this.props
    const rowStyle = new Style(styles, 'row')
      .addIf('row-selected', selected)
      .addIf('row-hovered', this.state.isHovered)

    return (
      <tr
        className={rowStyle.getClasses()}
        onClick={onClick}
        onMouseEnter={this.hoverOn}
        onMouseLeave={this.hoverOff}
      >
        {selectable && (
          <TableRowCell select={true}>
            <label
              className={styles['select-label']}
              onClick={this.markEvent}
              onMouseEnter={this.hoverOff}
              onMouseLeave={this.hoverOn}
            >
              <Checkbox
                checked={selected}
                className={styles.checkbox}
                disabled={selectableMode === 'multiDisabled'}
                onChange={this.selectRow.bind(this)}
              />
            </label>
          </TableRowCell>
        )}
        {this.renderChildren()}
      </tr>
    )
  }
}
