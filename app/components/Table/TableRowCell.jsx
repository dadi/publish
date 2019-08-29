import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Table.css'

/**
 * A table row.
 */
export default class TableRowCell extends React.Component {
  static propTypes = {
    /**
     * When `true`, any empty row cells will be filled with a text element
     * saying *None*.
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
    const {onHover, select} = this.props

    const cellStyle = new Style(styles, 'cell').addIf('select-cell', select)

    return (
      <td className={cellStyle.getClasses()}>
        {React.Children.map(this.renderChildren(), child =>
          // If the child is a HTMLElement (type is a string), don't do anything.
          // Otherwise the child is a React Component; pass the onHover callback.
          typeof child.type === 'string'
            ? child
            : React.cloneElement(child, {onHover})
        )}
      </td>
    )
  }

  renderChildren() {
    const {children, fillBlanks} = this.props

    if (!React.Children.count(children) && fillBlanks) {
      return <span className={styles['row-cell-blank']}>None</span>
    }

    return children
  }
}
