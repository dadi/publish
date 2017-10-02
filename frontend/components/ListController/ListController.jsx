'use strict'

import {h, Component} from 'preact'
import proptypes from 'proptypes'

import Style from 'lib/Style'
import styles from './ListController.css'

/**
 * A bar with various types of controls that affect the list of results
 * displayed in a list/table.
 */
export default class ListController extends Component {
  static propTypes = {
    /**
     * The list of controls to be rendered on the right-hand side of the bar.
     */
    children: proptypes.node
  }

  render() {
    const {children} = this.props

    if (!children.length) return null

    return (
      <div class={styles.container}>
        {children.map(control => {
          return (
            <div class={styles.control}>
              {control}
            </div>
          )
        })}
      </div>
    )
  }
}
