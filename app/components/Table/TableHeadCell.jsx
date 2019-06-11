import IconArrow from 'components/IconArrow/IconArrow'
import proptypes from 'prop-types'
import React from 'react'
import Style from 'lib/Style'
import styles from './Table.css'

/**
 * A table head cell.
 */
export default class TableHeadCell extends React.Component {
  static propTypes = {
    /**
     * Whether to include a sorting arrow next to the table head cell label.
     * If present, it should be a string containing the direction of the arrow.
     */
    arrow: proptypes.oneOf(['down', 'up']),

    /**
     * The text content of the table head cell.
     */
    annotation: proptypes.node,

    /**
     * The text content of the table head cell.
     */
    children: proptypes.node,

    /**
     * Whether the row is used to hold a selection checkbox.
     */
    select: proptypes.bool
  }

  static defaultProps = {
    arrow: null
  }

  render() {
    const {arrow, annotation, children, select} = this.props
    const cellStyle = new Style(styles, 'cell', 'head-cell')
      .addIf('head-cell-selected', arrow)
      .addIf('select-cell', select)

    return (
      <th className={cellStyle.getClasses()}>
        {arrow && (
          <IconArrow
            className={styles['head-cell-arrow']}
            width={8}
            height={5}
            direction={arrow}
          />
        )}

        <span className={styles['head-cell-label']}>{children}</span>

        {annotation}
      </th>
    )
  }
}
