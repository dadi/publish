'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './Table.css'

import IconArrow from 'components/IconArrow/IconArrow'

/**
 * A table head cell.
 */
export default class TableHeadCell extends Component {
  static propTypes = {
    /**
     * Whether to include a sorting arrow next to the table head cell label. If present, it should be a string containing the direction of the arrow.
     */
    arrow: proptypes.oneOf(['down', 'up']),

    /**
     * The text content of the table head cell.
     */
    annotation: proptypes.string,

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
    const {arrow, annotation, select} = this.props
    let cellStyle = new Style(styles, 'cell', 'head-cell')

    cellStyle.addIf('head-cell-selected', arrow)
    cellStyle.addIf('select-cell', select)

    return (
      <th class={cellStyle.getClasses()}>
        {arrow &&
          <IconArrow
            className={styles['head-cell-arrow']}
            width={8}
            height={5}
            direction={arrow}
          />
        }

        <span class={styles['head-cell-label']}>
          {this.props.children}
        </span>
        {annotation}
      </th>
    )
  }     
}
