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
    children: proptypes.node
  }

  static defaultProps = {
    arrow: null
  }

  render() {
    const {arrow} = this.props
    let cellStyle = new Style(styles, 'cell', 'head-cell')

    cellStyle.addIf('select-cell', this.props.select)

    return (
      <th class={cellStyle.getClasses()}>
        {arrow &&
          <IconArrow
            class={styles['head-cell-arrow']}
            width={10}
            height={10}
            direction={arrow}
          />
        }

        <span class={styles['head-cell-label']}>
          {this.props.children}
        </span>
      </th>
    )
  }
}
